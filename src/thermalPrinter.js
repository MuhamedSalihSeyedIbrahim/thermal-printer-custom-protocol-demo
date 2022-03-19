#! /usr/bin/env node
const escpos = require("escpos");
const escposUsb = require("escpos-usb");

function getPrinterInstance(
  adapter = "USB",
  options = { encoding: "GB18030" /* default */ }
) {
  const device = getDevice(adapter),
    printer = new escpos.Printer(device, options);

  return printer;
}

function getDevice(adapter = "", options = { uri: "", adapter: null }) {
  let device = null;

  switch (adapter.toUpperCase()) {
    case "NETWORK": {
      device = new escpos.Network(options.uri || "localhost");
      break;
    }
    case "SERIAL": {
      device = new escpos.Serial(options.uri || "/dev/usb/lp0");
      break;
    }
    case "USB": {
      escpos.USB = options.adapter || escposUsb;
      device = new escpos.USB();
      break;
    }
    default: {
      throw new Error(`Unknown printer adapter Selected`);
    }
  }
  return device;
}

async function print(printer, content, options) {
  const { text, barCode, qrCode } = content;

  return printer.open((err) => {
    if (err) {
      throw err;
    }

    printer
      .font(options.font || "a")
      .align(options.align || "ct")
      .style(options.style || "bu")
      .size(
        ...(options.size && options.size.length === 2 ? options.style : [1, 1])
      );

    if (text || text == "") {
      printer.text(text);
    }

    if (barCode) {
      printer.barcode(...barCode);
    }

    if (qrCode) {
      printer.qrimage(qrCode, function (err) {
        if (err) {
          throw err;
        }

        this.cut();
        this.close();
      });
    }
  });
}

function buildParamsObj(entries) {
  const result = {};
  for (const [key, value] of entries) {
    // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

function getParsedData(data) {
  const { hostname, searchParams } = new URL(data);

  const { adapter, barCode, qrCode, uri, font, align, style, size } =
    buildParamsObj(searchParams);
  const options = {
      uri,
      font,
      align,
      style,
      size: size ? size.split("") : [],
    },
    content = {
      hostname,
      barCode,
      qrCode,
    };

  return {
    content,
    adapter,
    options,
  };
}

async function main() {
  try {
    const { argv } = process;
    const rawData = argv.slice(2, argv.length).shift();
    const { adapter, options, content } = getParsedData(rawData);

    console.log(JSON.stringify({ adapter, options, content }));
    const printer = getPrinterInstance(adapter, options);
    await print(printer, content, options);
  } catch (err) {
    console.error(err);
  }
}

main();
