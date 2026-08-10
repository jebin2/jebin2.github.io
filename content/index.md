# Complete Markdown Style Test

This document contains examples of all markdown elements to test your blog's CSS styling.

## Headers and Typography

### This is an H3 Header
#### This is an H4 Header
##### This is an H5 Header
###### This is an H6 Header

## Text Formatting

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use __bold__ and _italic_ with underscores.

Here's some ~~strikethrough text~~ and some `inline code` within a sentence.

## Links and References

Here are different types of links:

- [Inline link](https://www.example.com)
- [Link with title](https://www.example.com "Example Website")
- <https://www.example.com> (automatic link)
- [Reference link][1] using reference notation

[1]: https://www.example.com "Reference link"

## Lists

### Unordered Lists

- First item
- Second item with a longer description that might wrap to multiple lines
  - Nested item 1
  - Nested item 2
    - Deep nested item
- Third item
- Fourth item

### Ordered Lists

1. First numbered item
2. Second numbered item
   1. Nested numbered item
   2. Another nested item
3. Third numbered item
4. Fourth numbered item

### Mixed Lists

1. Ordered item
   - Unordered sub-item
   - Another unordered sub-item
2. Another ordered item
   1. Nested ordered
   2. Another nested ordered

## Blockquotes

> This is a simple blockquote.

> This is a longer blockquote that demonstrates how multiple sentences look within a quote block. It should have proper spacing and styling to make it stand out from regular paragraphs.

> ### Quote with Header
> 
> This blockquote contains a header and multiple paragraphs to show how complex content looks within quotes.
> 
> It can even contain **bold text** and *italic text*.

### Nested Blockquotes

> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

## Code Examples

### Inline Code

Use `console.log()` to output data in JavaScript. You can also use `npm install` commands and `file.txt` names.

### Code Blocks

```javascript
// JavaScript example
function greetUser(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to the blog, ${name}`;
}

const user = "John";
greetUser(user);
```

```python
# Python example
def calculate_fibonacci(n):
    if n <= 1:
        return n
    else:
        return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
```

```css
/* CSS example */
.blog-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.highlight {
    background-color: #fff3cd;
    padding: 0.5rem;
    border-radius: 4px;
}
```

```bash
# Bash commands
git clone https://github.com/username/repository.git
cd repository
npm install
npm start
```

### Code Without Language Specification

```
This is a plain code block
without any language specification.
It should still be formatted properly
with monospace font and background.
```

## Tables

### Simple Table

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |
| Row 3, Col 1 | Row 3, Col 2 | Row 3, Col 3 |

### Table with Alignment

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left | Center | Right |
| This is a longer text | Short | 123.45 |
| Short | This is center aligned | 67.89 |

### Complex Table

| Feature | Basic Plan | Pro Plan | Enterprise |
|---------|------------|-----------|------------|
| **Storage** | 10GB | 100GB | Unlimited |
| **Users** | 1 | 5 | Unlimited |
| **Support** | Email | Priority | 24/7 Phone |
| **Price** | $9/month | $29/month | Contact Sales |

## Images

![Sample Image](index.png)

*Caption: This is a sample image with a caption below it.*

## Horizontal Rules

Here's content before a horizontal rule.

---

Here's content after a horizontal rule.

***

Another horizontal rule style.

___

And another one.

## Task Lists (GitHub Flavored Markdown)

- [x] Completed task
- [x] Another completed task
- [ ] Incomplete task
- [ ] Another incomplete task
  - [x] Sub-task completed
  - [ ] Sub-task incomplete

## Footnotes

This sentence has a footnote[^1].

This sentence has another footnote[^note].

[^1]: This is the first footnote.
[^note]: This is a named footnote with more detailed information that might span multiple lines if needed.

## Special Characters and Escaping

Here are some special characters: & < > " ' 

You can escape markdown: \*not italic\* \`not code\` \# not header

## Line Breaks and Paragraphs

This is the first paragraph.

This is the second paragraph after a blank line.

This line ends with two spaces for a line break.  
This line comes after the line break.

## Emphasis Combinations

- **Bold and *italic* combined**
- ***All bold and italic***
- `code with **bold** inside` (bold won't work)
- *Italic with `code` inside*

## Definition Lists (if supported)

Term 1
:   Definition 1

Term 2
:   Definition 2
    with additional details on a new line

Complex Term
:   This definition has multiple paragraphs.

    This is the second paragraph of the definition.

## Mathematical Expressions (if supported)

Inline math: $E = mc^2$

Block math:
$$
\sum_{i=1}^n x_i = x_1 + x_2 + ... + x_n
$$

## HTML Elements (if allowed)

<details>
<summary>Click to expand</summary>
This content is hidden by default and can be expanded.
</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> to copy

<mark>Highlighted text</mark>

## Long Content Test

This section contains a longer paragraph to test how your blog handles extensive text content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

## Conclusion

This comprehensive test document includes all major markdown elements. Use this to verify that your CSS styling works correctly with different types of content. The styling should be consistent, readable, and visually appealing across all these different markdown features.