// public/javascript/blog.js
// Initialize TinyMCE

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

// Publish blog function
async function publishBlog(formData) {
    try {
        const response = await fetch('/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Blog published successfully!');
            setTimeout(() => {
                window.location.href = `/blogs/${data.blog.slug}`;
            }, 2000);
        } else {
            throw new Error(data.message || 'Failed to publish blog');
        }
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Save as draft function
async function saveDraft(formData) {
    try {
        const response = await fetch('/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        if (response.ok) {
            showAlert('Draft saved successfully!', 'warning');
        } else {
            throw new Error(data.message || 'Failed to save draft');
        }
    } catch (error) {
        console.error("Error Here", error);
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
    alertContainer.append(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

document.getElementById('save-draft')?.addEventListener('click', async (event) => {
    event.preventDefault();

    const draftButton = document.getElementById('save-draft-btn');
    draftButton.ariaDisabled = true;
    draftButton.disabled = true;

    const formData = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        content: tinymce.get('content').getContent(),
        status: 'draft'
    };
    await saveDraft(formData);

    setTimeout(() => {
        draftButton.ariaDisabled = false;
        draftButton.disabled = false;
    }, 3000);
});

document.getElementById('publish-blog-btn')?.addEventListener('click', async (event) => {
    event.preventDefault();

    const publishButton = document.getElementById('publish-blog-btn');
    publishButton.ariaDisabled = true;
    publishButton.disabled = true;

    const formData = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        content: tinymce.get('content').getContent(),
        // image: document.getElementById('imagePreview').innerHTML,
        status: 'published'
    };
    await publishBlog(formData);

    setTimeout(() => {
        publishButton.ariaDisabled = false;
        publishButton.disabled = false;
    }, 3000);
});


// Character count for title and subtitle

document.getElementById('title')?.addEventListener('input', function () {
    document.getElementById('titleCount').textContent =
        `${this.value.length}/200 characters`;
});

document.getElementById('subtitle')?.addEventListener('input', function () {
    document.getElementById('subtitleCount').textContent =
        `${this.value.length}/500 characters`;
});


// Image manipulation and upload
function previewImage(event) {
    const imagePreview = document.getElementById("imagePreview");
    const file = event.target.files[0];
    console.log(file);
    if (file) {
        const reader = new FileReader();
        console.log(reader);
        reader.onload = function () {
            imagePreview.src = reader.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById('image-input')?.addEventListener('change', (event) => {
    // event.preventDefault();
    previewImage(event);
});

document
    .getElementById("unsplashSearch")
    .addEventListener("input", async function () {
        const query = this.value;
        
        const gallery = document.getElementById("unsplashGallery");
        gallery.innerHTML = ""; // Clear previous results

        if (query.length > 2) {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`
            );
            const data = await response.json();

            data.results.forEach((image) => {
                const imgElement = document.createElement("img");
                imgElement.src = image.urls.small;
                imgElement.alt = image.description || "Unsplash Image";
                imgElement.className = "img-thumbnail";
                imgElement.style.cursor = "pointer";
                imgElement.addEventListener("click", () =>
                    selectUnsplashImage(image.urls.small)
                );
                gallery.appendChild(imgElement);
            });
        }
    });

function selectUnsplashImage(imageUrl) {
    const imagePreview = document.getElementById("imagePreview");
    imagePreview.src = imageUrl;
    imagePreview.style.display = "block";

    // Close modal
    const unsplashModal = document.getElementById("unsplashModal");
    const modalInstance = bootstrap.Modal.getInstance(unsplashModal);
    modalInstance.hide();
}