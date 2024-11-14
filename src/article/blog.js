// article/blog.js

import { marked } from "marked";

const mkdContent = `
# Hello World
This is a paragraph with **bold text** and *italic text*.

- Item 1
- Item 2
- Item 3
`;

const htmlContent = marked(mkdContent);
console.log(htmlContent);