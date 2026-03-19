#!/usr/bin/env node
/**
 * Nhập khách mời vào guests.json (chạy: node guests.js)
 * - Tự tạo id 5 ký tự (a-z, 0-9), không trùng key hiện có
 * - Lặp liên tục; Ctrl+C để thoát
 */

'use strict';

var fs = require('fs');
var path = require('path');
var readline = require('readline');

var GUESTS_PATH = path.join(__dirname, 'guests.json');
var CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomId5() {
  var s = '';
  for (var i = 0; i < 5; i++) {
    s += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return s;
}

/** Id duy nhất trong object guests */
function uniqueId(guests) {
  var id;
  do {
    id = randomId5();
  } while (guests[id]);
  return id;
}

function loadGuests() {
  if (!fs.existsSync(GUESTS_PATH)) {
    return {};
  }
  var raw = fs.readFileSync(GUESTS_PATH, 'utf8');
  try {
    var data = JSON.parse(raw);
    return typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {};
  } catch (e) {
    console.error('Lỗi đọc guests.json:', e.message);
    process.exit(1);
  }
}

function saveGuests(guests) {
  fs.writeFileSync(GUESTS_PATH, JSON.stringify(guests, null, 2) + '\n', 'utf8');
}

function createRl() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, prompt) {
  return new Promise(function (resolve) {
    rl.question(prompt, function (answer) {
      resolve(answer);
    });
  });
}

async function main() {
  var rl = createRl();

  process.on('SIGINT', function () {
    console.log('\nĐã dừng (Ctrl+C).');
    rl.close();
    process.exit(0);
  });

  console.log('Nhập khách mời → lưu guests.json | Ctrl+C để thoát\n');

  while (true) {
    var guests = loadGuests();
    var id = uniqueId(guests);

    console.log('────────────────────────────');
    console.log('ID mới: ' + id);

    var x = (await question(rl, 'Xưng hô: ')).trim();
    var n = (await question(rl, 'Tên khách: ')).trim();

    guests[id] = { x: x, n: n };
    saveGuests(guests);

    console.log('Đã lưu: ?i=' + id + '\n');
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
