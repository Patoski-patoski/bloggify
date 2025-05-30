// public/javascript/blog.js
// Initialize TinyMCE

// eslint-disable-next-line no-undef
tinymce.init({
    selector: 'textarea',
    height: 1000,
    plugins: [
        // Core editing features
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
    ],
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
    tinycomments_mode: 'embedded',
    tinycomments_author: 'Author name',
    mergetags_list: [
        { value: 'First.Name', title: 'First Name' },
        { value: 'Email', title: 'Email' },
    ],
    setup: function (editor) {
        // Add change event listener
        editor.on('change', function () {
            const content = editor.getContent(); // Get the current content

            setTimeout(() => { 
                saveDraftContent(content);
            }, 15000);
        });
    }
});
// Function to save the draft content
async function saveDraftContent(content) {
    const formData = {
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        image: document.getElementById("imagePreview").src,
        content: content, // Use the updated content
        status: 'draft'
    };

    if (formData.title)
        await saveDraft(formData);
}

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
        console.error(error);
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
            if (data.title)
                showAlert('Draft saved successfully!', 'warning');
        } else {
            throw new Error(data.message || 'Failed to save draft');
        }
    } catch (error) {
        console.error(error);
        showAlert(error.message, 'danger');
    }
}

// Show alert function
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    alertContainer.append(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

document.getElementById('save-draft-btn')?.addEventListener('click', async (event) => {
    event.preventDefault();

    const draftButton = document.getElementById('save-draft-btn');
    draftButton.ariaDisabled = true;
    draftButton.disabled = true;
    const title = document.getElementById('title').value;

    const formData = {
        title,
        subtitle: document.getElementById('subtitle').value,
        image: document.getElementById("imagePreview").src,
        // eslint-disable-next-line no-undef
        content: tinymce.get('content').getContent(),
        status: 'draft'
    };

    setTimeout(() => {
        draftButton.ariaDisabled = false;
        draftButton.disabled = false;
    }, 5000);

    if(title)
        await saveDraft(formData);
    else {
        showAlert('Failed to save to draft: Title not found', 'danger');
        return;
    } 
});

document.getElementById('publish-blog-btn')?.addEventListener('click', async (event) => {
    event.preventDefault();

    const publishButton = document.getElementById('publish-blog-btn');
    publishButton.ariaDisabled = true;
    publishButton.disabled = true;

    const title = document.getElementById('title').value;
    const formData = {
        title,
        subtitle: document.getElementById('subtitle').value,
        // eslint-disable-next-line no-undef
        content: tinymce.get('content').getContent(),
        image: document.getElementById("imagePreview").src,
        status: 'published'
    };

    setTimeout(() => {
        publishButton.ariaDisabled = false;
        publishButton.disabled = false;
    }, 5000);

    if (title)
        await publishBlog(formData);
    else{
        showAlert('Failed to save to draft: Title not found', 'danger');
        return;
    }
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


function previewImage(event) {
    const imagePreview = document.getElementById("imagePreview");
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function () {
            imagePreview.src = reader.result; // Set the src of the image to the file's data URL
            imagePreview.style.display = "block"; // Show the image
        };
        reader.readAsDataURL(file); // Read the file as a data URL
    } else {
        imagePreview.style.display = "none"; // Hide the image if no file is selected
    }
}
document.getElementById('image')?.addEventListener('change', (event) => {
    alert('Changed');
    previewImage(event);
});
document.getElementById("unsplashSearch").addEventListener(
    "input", async function () {
        const query = this.value;
        const gallery = document.getElementById("unsplashGallery");
        gallery.innerHTML = ""; // Clear previous results
        document.getElementById('image').value = ''; // Clear previous results

        if (query.length > 2) {
            // eslint-disable-next-line no-undef
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
            const data = await response.json();
            data.results.forEach((image) => {
                const imgElement = document.createElement("img");
                imgElement.src = image.urls.small;

                // to get an array of unsplash images, get from imgElement.src and store in an array
                // console.log("img element", imgElement.src);
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
    console.log('imagePreview.src', imagePreview.src);
    imagePreview.style.display = "block";

    // Close modal
    const unsplashModal = document.getElementById("unsplashModal");
    // eslint-disable-next-line no-undef
    const modalInstance = bootstrap.Modal.getInstance(unsplashModal);
    console.log(modalInstance);
    modalInstance.hide();
}