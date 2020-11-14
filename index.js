const axios = require("axios");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const url = "https://en.m.wikipedia.org/wiki/List_of_Flip_or_Flop_episodes";

async function go() {
    const { data: html } = await axios(url);
    const { document } = new JSDOM(html).window;
    const rows = Array.from(document.querySelectorAll("tr.vevent"));

    const row_column = rows.map(row => Array.from(row.children));

    let data = [
        `"No. Overall","No. in season","Title","Original air date","Cost of home ($)","Closing cost ($)","Rehab cost ($)","Sale price ($)","Profit/loss ($)","Contractor"`,
    ];

    row_column.forEach(row => {
        let rowdata = [];
        row.forEach((column, idx) => {
            if (idx === 2 || idx === 9) {
                rowdata.push(
                    JSON.stringify(
                        column.textContent.replace(/[+"]/g, "").trim()
                    )
                );
            } else if (idx === 3) {
                rowdata.push(new Date(column.textContent.trim()).toJSON());
            } else {
                rowdata.push(
                    parseInt(column.textContent.replace(/[-+,]/g, "").trim())
                );
            }
        });
        if (rowdata.length === 10) data.push(rowdata.join());
    });
    fs.writeFileSync("data.csv", data.join("\n"), "utf-8");
}

go();
