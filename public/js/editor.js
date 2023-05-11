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
            ref = document.createElement(`h${exec[0].length}`);
            ref.innerHTML = "<br>";

            fragment.appendChild(ref);
            parent.append(fragment);
            anchorNode.remove();
            selection.collapse(ref);
          }
          if (tag === "*") {
            let innerHTML;
            const pHtml = parent.innerHTML;
            innerHTML = pHtml.replace(/(\*+)([^\s\*]+)\1/, "<em>$2</em>");
            const div = document.createElement("div");
            div.innerHTML = innerHTML;
            console.log(div.children);
            parent.innerHTML = innerHTML;
            for (let node of parent.childNodes) {
              if (node.textContent == div.children[0].textContent) {
                selection.collapse(node);
                break;
              }
            }
            // selection.collapse(parent, parent.childNodes.length);

            // selection.collapse(editor, 2)
            // parent.append(ref);
            // anchorNode.data += exec[2];

            // selection.collapse(ref);
            // ref = document.createElement("div");
            // ref.innerHTML = marked.parseInline(exec[0]);

            // let index = 0;

            // if (!anchorNode.nextSibling) {
            //   parent.append(...ref.childNodes);
            //   index = parent.childNodes.length - 1;
            // } else {
            //   parent.insertBefore(...ref.childNodes, anchorNode.nextSibling);
            //   index = [parent.childNodes].find((node) => node === anchorNode);
            // }

            // anchorNode.remove();
            // selection.collapse(parent, index);
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
