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
const rules = [
  // # foo
  ["h", /(#+)(\s|&nbsp;)/g],
  // *foo*
  ["*", /(\*+)([^\s\*]+)\1\s/g],
  // // 1. foo
  ["", /\d+\.(\s|&nbsp;)\S+/],
  // // -. foo
  ["", /-\.(\s|&nbsp;)\S+/],
  // // ~foo~
  ["", /(~+)\w+\1(\s|&nbsp;)/],
  // // `foo`
  ["", /(`+)\w+\1(\s|&nbsp;)/],
];

window.onload = function () {
  const test = document.querySelector("#test");
  test.addEventListener("keypress", function (e) {
    setTimeout(() => {
      const { key } = e;
      if (key === "Enter") {
      } else {
        const selection = window.getSelection();
        console.log(selection.anchorNode.data);
        const data = selection.anchorNode.data;
        // console.log(sel.anchorNode.parentNode.innerHTML);
        let found = false;

        const tokens = [];
        for (let i = 0; i < rules.length; i++) {
          const [tag, rule] = rules[i];
          let exec;
          while ((exec = rule.exec(data))) {
            tokens.push([tag, exec]);
          }
        }

        let temp = "";
        for (let i = 0; i < tokens.length; i++) {
          const [tag, exec] = tokens[i];
          const { input, index } = exec;
          if (tag === "*") {
            temp +=
              input.slice(0, index) + "\u200b" + marked.parseInline(exec[0]);
            "\u200b" + input.slice(index + exec[0].length);
            const elm = document.createElement("span");
            elm.innerHTML = temp;
            selection.anchorNode.parentElement.insertBefore(
              elm,
              selection.anchorNode
            );
            selection.anchorNode.remove();
            selection.collapse(
              selection.anchorNode.parentElement,
              [...selection.anchorNode.parentElement.childNodes].indexOf(elm)
            );
          }
        }
      }
    });
  });
  const f = document.querySelector("#board");

  editor.addEventListener("keypress", function (e) {
    setTimeout(function () {
      const selection = window.getSelection();

      const { anchorNode } = selection;

      const { nodeType } = anchorNode;
      let parent;
      if (anchorNode.data === void 0) {
        const childNodes = anchorNode.parentElement.childNodes;
        // 真实的parent
        parent = childNodes[childNodes.length - 1];
      } else {
        parent = anchorNode.parentElement;
      }

      // console.log(anchorNode.data, anchorNode.parentElement.childNodes, parent);
      const tokens = [];
      let found;
      for (let i = 0, len = rules.length; i < len; i++) {
        const [tag, rule] = rules[i];
        let exec;
        // let exec = rule.exec(anchorNode.data);
        while ((exec = rule.exec(anchorNode.data))) {
          fount = true;
          // console.log(exec);
          tokens.push([tag, exec]);
        }
        if (found) break;
      }
      if (tokens.length) {
        const fragment = document.createDocumentFragment();

        let ref;
        for (let [tag, exec] of tokens) {
          if (tag === "h") {
            const nodes = Array.from(parent.childNodes);
            let left = [];
            let right = [];
            for (let i = 0, len = nodes.length; i < len; i++) {
              const node = nodes[i];
              if (node === anchorNode) {
                if (i > 0) {
                  left = nodes.slice(0, i);
                }
                if (i < len - 1) {
                  right = nodes.slice(i + 1);
                }
              }
              const h = document.createElement("h" + exec[1].length);
              h.innerText = exec[0].slice(exec[1].length);
              parent.innerHTML =
                left.map((node) => node.outerHTML) +
                h.outerHTML +
                right.map((node) => node.outerHTML);
            }
          }
          if (tag === "*") {
            const nodes = Array.from(parent.childNodes);
            let left = [];
            let right = [];
            for (let i = 0, len = nodes.length; i < len; i++) {
              const node = nodes[i];
              if (node === anchorNode) {
                if (i > 0) {
                  left = nodes.slice(0, i);
                }
                if (i < len - 1) {
                  right = nodes.slice(i + 1);
                }
              }

              let leftData = exec.input.slice(0, exec.index);
              let tags;
              switch (exec[1].length) {
                case 1:
                  tags = ["em"];
                  break;
                case 2:
                  tags = ["strong"];
                  break;
                case 3:
                  tags = ["em", "strong"];
                  break;
                default:
                  tags = ["em"];
                  break;
              }

              // //case1
              // let ref;
              // let head;
              // for (let i = 0, len = tags.length; i < len; i++) {
              //   const tag = tags[i];
              //   const cur = document.createElement(tag);
              //   if (!head) head = cur;
              //   if (ref) ref.append(cur);
              //   ref = cur;
              // }

              // console.log(window.getSelection());
              // console.log({ exec, data: anchorNode.data });

              // anchorNode.data = anchorNode.data.replace(/\*/g, "");
              // ref.append(anchorNode);
              // parent.append(head);
              // selection.collapse(anchorNode, exec.index + exec[2].length);
            }
          }
        }
      }
    }, 100);
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
