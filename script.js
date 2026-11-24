(function () {
  var cur = "0",
    prev = null,
    op = null,
    fresh = false;
  var elV = document.getElementById("value");
  var elE = document.getElementById("expr");

  function fmt(s) {
    if (s === "Error") return s;
    var neg = s[0] === "-";
    var p = s.replace("-", "").split(".");
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "-" : "") + p.join(".");
  }

  function show() {
    elV.textContent = fmt(cur);
    elE.textContent = prev !== null && op ? fmt(String(prev)) + " " + op : "";
  }

  function calc(a, b, o) {
    a = parseFloat(a);
    b = parseFloat(b);
    var r =
      o === "+"
        ? a + b
        : o === "−"
          ? a - b
          : o === "×"
            ? a * b
            : b === 0
              ? NaN
              : a / b;
    if (!isFinite(r)) return "Error";
    return String(parseFloat(r.toPrecision(12)));
  }

  function num(d) {
    if (cur === "Error") cur = "0";
    if (fresh) {
      cur = "0";
      fresh = false;
    }
    if (cur.replace(/[-.]/g, "").length >= 12) return;
    cur = cur === "0" ? d : cur + d;
  }

  function chooseOp(o) {
    if (cur === "Error") return;
    if (op && !fresh) {
      cur = calc(prev, cur, op);
      if (cur === "Error") {
        op = null;
        prev = null;
        return;
      }
    }
    prev = cur;
    op = o;
    fresh = true;
  }

  function act(a, v) {
    if (a === "num") num(v);
    else if (a === "dot") {
      if (fresh) {
        cur = "0";
        fresh = false;
      }
      if (cur.indexOf(".") < 0 && cur !== "Error") cur += ".";
    } else if (a === "op") chooseOp(v);
    else if (a === "eq") {
      if (op && prev !== null) {
        cur = calc(prev, cur, op);
        op = null;
        prev = null;
        fresh = true;
      }
    } else if (a === "clear") {
      cur = "0";
      prev = null;
      op = null;
      fresh = false;
    } else if (a === "sign") {
      if (cur !== "0" && cur !== "Error")
        cur = cur[0] === "-" ? cur.slice(1) : "-" + cur;
    } else if (a === "percent") {
      if (cur !== "Error")
        cur = String(parseFloat((parseFloat(cur) / 100).toPrecision(12)));
    } else if (a === "back") {
      if (fresh || cur === "Error") return;
      cur =
        cur.length > 1 && !(cur.length === 2 && cur[0] === "-")
          ? cur.slice(0, -1)
          : "0";
    }
    show();
  }

  // Mouse / touch
  document.getElementById("keys").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) act(b.dataset.a, b.dataset.v);
  });

  // Keyboard
  var map = { "*": "×", "/": "÷", "-": "−", "+": "+" };
  document.addEventListener("keydown", function (e) {
    var k = e.key,
      sel = null;
    if (/^[0-9]$/.test(k)) {
      act("num", k);
      sel = '[data-a="num"][data-v="' + k + '"]';
    } else if (map[k]) {
      act("op", map[k]);
      sel = '[data-a="op"][data-v="' + map[k] + '"]';
    } else if (k === "." || k === ",") {
      act("dot");
      sel = '[data-a="dot"]';
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      act("eq");
      sel = '[data-a="eq"]';
    } else if (k === "Backspace") {
      act("back");
      sel = '[data-a="back"]';
    } else if (k === "Escape") {
      act("clear");
      sel = '[data-a="clear"]';
    } else if (k === "%") {
      act("percent");
      sel = '[data-a="percent"]';
    }
    if (sel) {
      var b = document.querySelector(sel);
      if (b) {
        b.classList.add("pressed");
        setTimeout(function () {
          b.classList.remove("pressed");
        }, 120);
      }
    }
  });

  // Theme toggle
  document.getElementById("theme").addEventListener("click", function () {
    var r = document.documentElement;
    var dark = r.dataset.theme
      ? r.dataset.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme = dark ? "light" : "dark";
  });

  show();
})();
