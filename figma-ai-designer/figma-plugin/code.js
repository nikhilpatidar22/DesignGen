
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
async function pollBackend() {
  try {
    const res = await fetch(BACKEND_URL);
    const cmds = await res.json();

    if (Array.isArray(cmds)) {
      for (const cmd of cmds) {
        await createNode(cmd);
      }
    } else if (cmds.status !== "no-command") {
      await createNode(cmds);
    }
  } catch (e) {
    console.error("Error polling backend:", e);
  } finally {
    setTimeout(pollBackend, POLL_INTERVAL);
  }
}

// Start polling
pollBackend();
figma.notify("MCP Figma plugin is running and polling backend...");
