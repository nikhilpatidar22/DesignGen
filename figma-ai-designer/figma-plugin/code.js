
const POLL_INTERVAL = 1000;
const BACKEND_URL = "http://127.0.0.1:4000/mcp/figma/next";

// Convert hex color (#RRGGBB) to RGB object for Figma
function hexToRgb(hex) {
  if (!hex) return { r: 1, g: 1, b: 1 };
  hex = hex.replace(/^#/, "");
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

// all nodes

function hexToRgb(hex) {
  if (!hex) return { r: 1, g: 1, b: 1 };
  hex = hex.replace(/^#/, "");
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}



async function updateNode(cmd) {
  try {
    const node = figma.getNodeById(cmd.id);
    if (!node) {
      console.warn("updateNode: node not found", cmd.id);
      return;
    }
    const props = cmd.props || {};
    for (const [k, v] of Object.entries(props)) {
      try {
        if (k === "color" || k === "background") {
          const color = hexToRgb(v);
          node.fills = [{ type: "SOLID", color }];
        } else if (k === "text" && node.type === "TEXT") {
          await figma.loadFontAsync(node.fontName || { family: "Inter", style: "Regular" });
          node.characters = v;
        } else if (k === "fontSize" && node.type === "TEXT") {
          node.fontSize = v;
        } else if (k in node) {
          node[k] = v;
        } else {
          // fallback: try set style-like properties
          if (k === "cornerRadius" && ("cornerRadius" in node)) node.cornerRadius = v;
          if (k === "stroke" && ("strokes" in node)) node.strokes = [{ type: "SOLID", color: hexToRgb(v) }];
        }
      } catch (err) {
        console.warn("updateNode prop error", k, err);
      }
    }
  } catch (err) {
    console.error("updateNode failure", err);
  }
}

async function moveNode(cmd) {
  try {
    const node = figma.getNodeById(cmd.id);
    if (!node) {
      console.warn("moveNode: node not found", cmd.id);
      return;
    }
    if (cmd.x !== undefined) node.x = cmd.x;
    if (cmd.y !== undefined) node.y = cmd.y;
  } catch (err) {
    console.error("moveNode failure", err);
  }
}

async function deleteNode(cmd) {
  try {
    const node = figma.getNodeById(cmd.id);
    if (!node) {
      console.warn("deleteNode: node not found", cmd.id);
      return;
    }
    node.remove();
  } catch (err) {
    console.error("deleteNode failure", err);
  }
}



// Create a single node from JSON element
async function createNode(el) {
  let node = null;

  switch (el.type) {
    case "rectangle":
      node = figma.createRectangle();
      node.resize(el.width, el.height);
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#FFFFFF") }];
      break;

    case "circle":
      node = figma.createEllipse();
      node.resize(el.width, el.height);
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#FFFFFF") }];
      break;

    case "ellipse":
      node = figma.createEllipse();
      node.resize(el.width, el.height);
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#FFFFFF") }];
      break;

    case "frame":
      node = figma.createFrame();
      node.resize(el.width, el.height);
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#FFFFFF") }];
      break;

    case "line":
      node = figma.createLine();
      node.strokes = [{ type: "SOLID", color: hexToRgb(el.color || "#000000") }];
      node.resize(el.width || 100, el.height || 0.1);
      break;

    case "polygon":
      node = figma.createPolygon();
      node.resize(el.width, el.height);
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#FFFFFF") }];
      break;

    case "star":
      node = figma.createStar();
      node.resize(el.width, el.height);
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#FFFFFF") }];
      break;

    case "text":
      await figma.loadFontAsync({ family: el.fontFamily || "Inter", style: "Regular" });
      node = figma.createText();
      node.characters = el.text || "";
      node.fontSize = el.fontSize || 16;
      node.fontName = { family: el.fontFamily || "Inter", style: "Regular" };
      node.fills = [{ type: "SOLID", color: hexToRgb(el.color || "#000000") }];
      if (el.textAlign === "CENTER") node.textAlignHorizontal = "CENTER";
      else if (el.textAlign === "RIGHT") node.textAlignHorizontal = "RIGHT";
      else node.textAlignHorizontal = "LEFT";
      break;

    case "image":
      if (el.url) {
        node = figma.createRectangle();
        node.resize(el.width, el.height);
        try {
          const response = await fetch(el.url);
          const arrayBuffer = await response.arrayBuffer();
          const image = figma.createImage(new Uint8Array(arrayBuffer));
          node.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" }];
        } catch (err) {
          console.error("Image load failed:", err);
        }
      }
      break;

    case "vector":
      node = figma.createVector();
      break;

    case "boolean":
      node = figma.createBooleanOperation();
      break;

    case "component":
      node = figma.createComponent();
      node.resize(el.width, el.height);
      break;

    case "instance":
      const comp = figma.createComponent();
      node = comp.createInstance();
      break;

    default:
      console.log("Unknown element type:", el.type);
      return;
  }

  if (node) {
    node.x = el.x || 0;
    node.y = el.y || 0;
    if (el.name) node.name = el.name;
    figma.currentPage.appendChild(node);
  }
}

// Poll backend for new commands
// async function pollBackend() {
//   try {
//     const res = await fetch(BACKEND_URL);
//     const cmds = await res.json();

//     if (Array.isArray(cmds)) {
//       for (const cmd of cmds) {
//         await createNode(cmd);
//       }
//     } else if (cmds.status !== "no-command") {
//       await createNode(cmds);
//     }
//   } catch (e) {
//     console.error("Error polling backend:", e);
//   } finally {
//     setTimeout(pollBackend, POLL_INTERVAL);
//   }
// }


async function pollBackend() {
  try {
    const res = await fetch(BACKEND_URL);
    if (!res.ok) {
      console.error("pollBackend: non-OK response", res.statusText);
      return;
    }

    const payload = await res.json();

    // Normalize to array of commands
    let commands = [];
    if (Array.isArray(payload)) {
      commands = payload;
    } else if (payload && payload.status === "no-command") {
      // nothing to do
      return;
    } else if (payload && payload.action) {
      commands = [payload];
    } else if (payload && Object.keys(payload).length > 0) {
      // Single create-like command
      commands = [payload];
    } else {
      // empty or unexpected payload
      return;
    }

    // Process commands sequentially (so order is preserved)
    for (const cmd of commands) {
      try {
        // If command uses "action" switch on it
        const action = (cmd.action || "create").toLowerCase();

        if (action === "update") {
          await updateNode(cmd);
        } else if (action === "move") {
          await moveNode(cmd);
        } else if (action === "delete") {
          await deleteNode(cmd);
        } else if (action === "create" || !cmd.action) {
          // fallback to your createNode implementation
          await createNode(cmd);
        } else {
          console.warn("Unknown action in cmd:", action, cmd);
        }
      } catch (cmdErr) {
        console.error("Error processing command:", cmd, cmdErr);
      }
    }
  } catch (e) {
    console.error("Error polling backend:", e);
  } finally {
    // continue polling always
    setTimeout(pollBackend, POLL_INTERVAL);
  }
}


// Start polling
pollBackend();
figma.notify("MCP Figma plugin is running and polling backend...");
