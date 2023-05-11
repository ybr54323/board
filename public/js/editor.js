const editor = document.querySelector("#editor");
const button = document.querySelector("#submit");

const axios = new window.axios.create();
/**
 * 
 * 
 * 

 */
function insertAfter(newElement, targetElement) {
  const parentElement = targetElement.parentElement;
  if (parentElement.lastChild === targetElement) {
    parentElement.appendChild(newElement);
  } else {
    parentElement.insertBefore(newElement, targetElement.nextSibling);
  }
}

window.onload = function () {
  let token = "";

  const rules = [
    // # foo
    /^#+\s$/,
    // *foo*
    /^(\*+)\S+\1\s$/g,
    // // 1. foo
    // /\d+\.\s/,
    // // -. foo
    // /^-\.$/,
    // // ~foo~
    // /^(~+)\w+\1$/,
    // // `foo`
    // /^(`+)\w+\1$/,
  ];
  const ignoreKeys = ["Backspace", "Control", "Shift", "Enter", "Alt"];

  const clearKeys = ["Enter"];
  editor.addEventListener("keypress", function (e) {
    setTimeout(() => {
      const selection = window.getSelection();
      const { anchorNode } = selection;
      if (anchorNode.nodeType !== 3) return;

      console.log(anchorNode);
      const list = anchorNode.textContent.split(" ");
      const tail = list[list.length - 1];
      console.warn(tail);

      // console.warn(anchorNode.nodeType);

      let found = false;
      let inline = false;

      for (let i = 0, len = rules.length; i < len && !found; i++) {
        const rule = rules[i];
        if (tail.match(rule)) {
          found = true;
          if (i == 0) inline = false;
          else inline = true;
          break;
        }
      }
      if (found) {
        const parser = marked[inline ? "parseInline" : "parse"];
        if (inline) {
        } else {
        }
        const html = parser(tail + "1");
        console.warn({ html, inline });
        const dom = document.createElement("div");
        dom.innerHTML = html;
        const toInsert = dom.children;
        // console.log(toInsert, dom.children);
        
        insertAfter(...toInsert,  anchorNode.parentElement)
        anchorNode.remove()

      }
      // if (found) {

      //   const parentElement = anchorNode.parentElement;
      //   parentElement.innerHTML = html;
      //   // anchorNode.remove();
      //   setTimeout(() => {
      //     selection.collapseToEnd(parentElement, 2);
      //   }, 25);
      // }
      // const { code, key } = e;
      // console.log({ code, key });
      // if (clearKeys.indexOf(key) > -1) {
      //   token = "";
      // } else if (key === "Backspace") {
      //   token[token.length - 1] = "";
      // } else if (ignoreKeys.indexOf(key) > -1) {
      // } else if (key === " ") {
      //   token += key;

      //   console.log(token);
      //   let found = false;
      //   let inline = false;
      //   for (let i = 0, len = rules.length; i < len && !found; i++) {
      //     if (token.match(rules[i])) {
      //       if (i === 0) inline = false;
      //       else inline = true;
      //       found = true;
      //       break;
      //     }
      //   }
      //   const parser = marked[inline ? "parseInline" : "parse"];
      //   const parsed = parser(token);
      //   console.log({ parsed });
      //   // if (token !== parsed) {
      //   //   const { anchorNode } = window.getSelection();
      //   //   const { parentElement } = anchorNode;
      //   //   const div = document.createElement("div");
      //   //   div.innerHTML = parsed;
      //   //   parentElement.insertBefore(div.childNodes, anchorNode.nextSibling);
      //   //   anchorNode.remove();
      //   // }
      // } else {
      //   token += key;
      // }
    }, 25);
  });

  editor.addEventListener("paste", (e) => {
    const selection = window.getSelection();
    const { anchorNode } = selection;
    const { parentElement } = anchorNode;

    const data = (e.clipboardData || window.clipboardData).items || [];

    const fileReader = new FileReader();

    for (var i = 0; i < data.length; i += 1) {
      if (data[i].kind == "string" && data[i].type.match("^text/plain")) {
        // 遍历拖拽项的内容
        data[i].getAsString(function (s) {
          e.target.appendChild(document.getElementById(s));
        });
      } else if (data[i].kind == "string" && data[i].type.match("^text/html")) {
        // 拖拽项的数据是 HTML
        console.log("... Drop: HTML");
      } else if (
        data[i].kind == "string" &&
        data[i].type.match("^text/uri-list")
      ) {
        // 拖拽项的数据是 URI
        console.log("... Drop: URI");
      } else if (data[i].kind == "file" && data[i].type.match("^image/")) {
        // 拖拽项的数据是一个图片
        var f = data[i].getAsFile();
        console.log("... Drop: File ");

        fileReader.onload = function (e) {
          var img = new Image();
          img.src = e.target.result;
          if (parentElement) {
            parentElement.insertBefore(img, anchorNode.nextSibling);
          } else {
            editor.appendChild(img);
          }
        };

        fileReader.readAsDataURL(f);
      }
    }
  });

  button.addEventListener("click", function (e) {
    const content = editor.innerHTML;
    const nameRegexp = /(?<=editor\/)[^\/]+/;
    let defaultName;
    (defaultName = window.location.href.match(nameRegexp)) &&
      ([defaultName] = defaultName);

    const name = window.prompt("输入name", defaultName || "");

    axios({
      url: "/editor",
      method: "post",
      data: {
        name,
        content,
      },
    }).then((res) => {
      console.warn(res);
    });
  });
};
