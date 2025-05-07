// // public/javascript/profile.js

// document.addEventListener('DOMContentLoaded', function () {
//     // Blog deletion handling
//     setupBlogDeletion();

//     // Quick publish functionality
//     setupQuickPublish();

//     // Image preview functionality
//     setupImagePreview();

//     // Tag management
//     setupTagManagement();

//     // Stats counter animation
//     animateCounters();

//     // Setup tab handling with URL params
//     setupTabHandling();
// });

// /**
//  * Setup blog deletion confirmation
//  */
// function setupBlogDeletion() {
//     let blogToDelete = null;
//     const deleteModal = document.getElementById('deleteModal');

//     if (!deleteModal) return;

//     const bsDeleteModal = new bootstrap.Modal(deleteModal);

//     // Set up event listeners for delete buttons
//     document.querySelectorAll('.blog-delete').forEach(button => {
//         button.addEventListener('click', function (e) {
//             e.preventDefault();
//             blogToDelete = this.dataset.slug;
//             bsDeleteModal.show();
//         });
//     });

//     // Set up confirmation button
//     const confirmBtn = document.getElementById('confirmDelete');
//     if (confirmBtn) {
//         confirmBtn.addEventListener('click', function () {
//             if (blogToDelete) {
//                 // Show loading state
//                 this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Deleting...';
//                 this.disabled = true;

//                 // Call the delete API
//                 fetch(`/api/blogs/${blogToDelete}`, {
//                     method: 'DELETE',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     credentials: 'same-origin'
//                 })
//                     .then(response => response.json())
//                     .then(data => {
//                         if (data.message === 'Blog deleted') {
//                             // Remove the blog card from the DOM
//                             const element = document.querySelector(`[data-slug="${blogToDelete}"]`).closest('.col-md-4');
//                             if (element) {
//                                 element.classList.add('fade-out');
//                                 setTimeout(() => {
//                                     element.remove();
//                                     // Update counters if needed
//                                     updateCounters();
//                                     // Show empty state if no more blogs
//                                     checkEmptyState();
//                                 }, 300);
//                             }

//                             // Show success message
//                             showAlert('Blog successfully deleted', 'success');
//                         } else {
//                             showAlert('Error deleting blog', 'danger');
//                         }

//                         // Reset button state
//                         confirmBtn.innerHTML = 'Delete';
//                         confirmBtn.disabled = false;

//                         // Hide modal
//                         bsDeleteModal.hide();
//                     })
//                     .catch(error => {
//                         console.error('Error:', error);
//                         showAlert('Error deleting blog', 'danger');

//                         // Reset button state
//                         confirmBtn.innerHTML = 'Delete';
//                         confirmBtn.disabled = false;

//                         // Hide modal
//                         bsDeleteModal.hide();
//                     });

                