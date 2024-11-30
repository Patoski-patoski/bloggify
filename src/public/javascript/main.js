// public/javascript/main.js

document.querySelector('#publish-blog').addEventListener('click', () => {
    const content = tinymce.get('content').getContent();
    console.log(content);
    publishBlog();
});

// Initialize TinyMCE
// <!-- Place the first <script> tag in your HTML's <head> -->
{/* <script src="https://cdn.tiny.cloud/1/qjghi2uugzibwngdvkyt0bx4p2of9fv7lystm3g1osuy1fcy/tinymce/7/tinymce.min.js" referrerpolicy="origin"></script> */}

// <!-- Place the following <script> and <textarea> tags your HTML's <body> -->
{/* <script> */}
  tinymce.init({
    selector: 'textarea',
    plugins: [
      // Core editing features
      'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
      // Your account includes a free trial of TinyMCE premium features
      // Try the most popular premium features until Dec 13, 2024:
      'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown',
      // Early access to document converters
      'importword', 'exportword', 'exportpdf'
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
      { value: 'First.Name', title: 'First Name' },
      { value: 'Email', title: 'Email' },
    ],
    ai_request: (request, respondWith) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
  });

// Character count for title and subtitle
document.getElementById('title').addEventListener('input', function () {
    document.getElementById('titleCount').textContent =
        `${this.value.length}/200 characters`;
});

document.getElementById('subtitle').addEventListener('input', function () {
    document.getElementById('subtitleCount').textContent =
        `${this.value.length}/500 characters`;
});

// Publish blog
async function publishBlog(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    console.log(title);
    const subtitle = document.getElementById('subtitle').value;
    const content = tinymce.get('content').getContent();

    if (!title || !content || content.length < 20) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }

    try {
        const response = await fetchs('/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                subtitle,
                content,
                status: 'published'
            })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Blog published successfully!');
            // Redirect to the published blog after 1 second
            setTimeout(() => {
                window.location.href = `/blogs/${data.blog.slug}`;
            }, 1000);
        } else {
            throw new Error(data.message || 'Failed to publish blog');
        }
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Save as draft
async function saveDraft() {
    const title = document.getElementById('title').value;
    const subtitle = document.getElementById('subtitle').value;
    const content = tinymce.get('content').getContent();

    try {
        const response = await fetch('/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                subtitle,
                content,
                status: 'draft'
            })
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Draft saved successfully!');
        } else {
            throw new Error(data.message || 'Failed to save draft');
        }
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}


// Show alert function
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
    alertContainer.appendChild(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
