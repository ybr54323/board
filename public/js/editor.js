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
  const f = document.querySelector("#board");

  const rules = [
    // # foo
    /#+(\s|&nbsp;)/,
    // *foo*
    /(\*+)\S+\1(\s|&nbsp;)/g,
    // // 1. foo
    /\d+\.(\s|&nbsp;)\S+/,
    // // -. foo
    /-\.(\s|&nbsp;)\S+/,
    // // ~foo~
    /(~+)\w+\1(\s|&nbsp;)/,
    // // `foo`
    /(`+)\w+\1(\s|&nbsp;)/,
  ];

  editor.addEventListener(
    "keypress",
    function (e) {
      setTimeout(function () {
        const selection = window.getSelection();

        const { anchorNode } = selection;

        const { nodeType } = anchorNode;

        /**
         * 在offset为0时的selection
         */
        if (nodeType === 1) {
          console.log((anchorNode.outerHTML = "<div class='none'><br></div>"));
        }
        /**
         * 在offset为>0时的selection
         */
        if (nodeType === 3) {
          const { parentElement, textContent } = anchorNode;
          console.log({ textContent, parentElement: parentElement.innerHTML });
          let found = false;
          let exec;
          let inline;
          let outerIndex;
          let index;
          let tokenLen = 0;

          for (let i = 0, len = rules.length; i < len; i++) {
            const rule = rules[i];
            exec = rule.exec(parentElement.innerHTML);
            if (exec) {
              index = exec.index;
              found = true;
              console.log(exec);
              tokenLen = exec[0].length;
              rule.lastIndex = 0;
              inline = i !== 0 && i !== 2;
              outerIndex = i;
              break;
            }
          }
          if (found) {
            const chars = parentElement.innerHTML.split("");
            const l = chars.slice(0, index).join("");
            const toParse = chars.slice(index, index + tokenLen).join("");
            const r = chars.slice(index + tokenLen).join("");

            if (inline) {
              let tem;
              const html = marked.parseInline(
                (tem = toParse.replace(/&nbsp;/g, " "))
              );
              console.log({ html, l, r, toParse });

              parentElement.innerHTML = l + html + r;
              selection.collapse(
                parentElement,
                !l && !r
                  ? parentElement.childNodes.length
                  : !r
                  ? parentElement.childNodes.length
                  : 1
              );
            } else {
              let html = marked.parse(toParse.replace(/&nbsp;/g, " "));
              html = html.replace(/(?<=>).*(?=<\/)/, "\u200b");

              console.log({ html, l, r, toParse });

              parentElement.innerHTML = l + html + r;
              selection.collapse(
                parentElement,
                !l && !r
                  ? parentElement.childNodes.length
                  : !r
                  ? parentElement.childNodes.length
                  : 1
              );
            }
          }
        }
      });
    },
    25
  );

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
          // if (parentElement) {
          //   parentElement.insertBefore(img, anchorNode.nextSibling);
          // } else {
          // }
          editor.appendChild(img);
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
