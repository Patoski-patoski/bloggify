
  // Event listener for all delete buttons
  document.querySelectorAll('.blog-delete').forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const slug = this.dataset.slug;
            document.getElementById('confirmDelete').dataset.slug = slug;
            document.getElementById('confirmDelete').dataset.isDraft = this.closest('.tab-pane').id === 'drafts' ? 'true' : 'false';
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
            deleteModal.show();
        });
  });

    // Event listener for the confirm delete button inside the modal
    document.getElementById('confirmDelete').addEventListener('click', async function() {
    const blogSlugToDelete = this.dataset.slug;
    const isDraft = this.dataset.isDraft === 'true';

    if (blogSlugToDelete) {
      try {
        console.log('Attempting to delete blog with slug:', blogSlugToDelete);
    const deleteUrl = `/blogs/${blogSlugToDelete}`;
    console.log('Sending DELETE request to URL:', deleteUrl);

    const response = await fetch(deleteUrl, {
        method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
          },
        });

    const data = await response.json();

    if (response.ok) {
        showAlert('Blog deleted successfully!', 'success');

    // Find and remove the correct card
    let deletedCard;
    if (isDraft) {
            // For drafts, find the card within the drafts tab
            const draftsTab = document.getElementById('drafts');
    deletedCard = draftsTab.querySelector(`[data-slug="${blogSlugToDelete}"]`)?.closest('.col-md-4');
          } else {
            // For published blogs, find the card within the published tab
            const publishedTab = document.getElementById('published');
    deletedCard = publishedTab.querySelector(`[data-slug="${blogSlugToDelete}"]`)?.closest('.col-md-4');
          }

    if (deletedCard) {
        deletedCard.remove();

    // Check if this was the last item and show empty state if needed
    const currentTab = isDraft ? document.getElementById('drafts') : document.getElementById('published');
    const remainingCards = currentTab.querySelectorAll('.col-md-4');

    if (remainingCards.length === 0) {
              const emptyStateHtml = isDraft
    ? `<div class="col-12 text-center py-5">
        <h3 class="text-muted">No drafts yet 😃</h3>
        <a href="/create" class="btn btn-primary mt-3">Create your first draft</a>
    </div>`
    : `<div class="col-12 text-center py-5">
        <h3 class="text-muted">No published blogs yet</h3>
        <a href="/create" class="btn btn-primary mt-3">Write your first blog</a>
    </div>`;

    currentTab.querySelector('.row').innerHTML = emptyStateHtml;
            }
          }

    // Hide the modal
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
        } else {
        showAlert(data.message || 'Failed to delete blog', 'danger');
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
    showAlert('An error occurred while deleting the blog.', 'danger');
      }
    }
  });

  // Event listener for publish buttons
  document.querySelectorAll('.blog-publish').forEach(button => {
        button.addEventListener('click', async function (event) {
            event.preventDefault();
            const blogSlugToPublish = this.dataset.slug;

            try {
                const response = await fetch(`/blogs/update/${blogSlugToPublish}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'published' })
                });

                const data = await response.json();

                if (response.ok) {
                    showAlert('Blog published successfully!', 'success');
                    // Reload the page to reflect changes
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    showAlert(data.message || 'Failed to publish blog', 'danger');
                }
            } catch (error) {
                console.error('Error publishing blog:', error);
                showAlert('An error occurred while publishing the blog.', 'danger');
            }
        });
  });

    // Function to show alerts
    function showAlert(message, type = 'success') {
        let alertContainer = document.getElementById('alert-container');

    // Create alert container if it doesn't exist
    if (!alertContainer) {
      const body = document.querySelector('body');
    const newAlertContainer = document.createElement('div');
    newAlertContainer.id = 'alert-container';
    newAlertContainer.style.position = 'fixed';
    newAlertContainer.style.top = '10px';
    newAlertContainer.style.right = '10px';
    newAlertContainer.style.zIndex = '1050';
    body.prepend(newAlertContainer);
    alertContainer = newAlertContainer;
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    alertContainer.appendChild(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }