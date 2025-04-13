
const wishlistTable = $('#wishlistTable').DataTable({
    columns: [
        { data: 'title' },
        { data: 'author' },
        { data: 'cover', orderable: false },
        { data: 'genres' },
        { data: 'id', orderable: false }
    ],
    responsive: true
});

document.addEventListener('DOMContentLoaded', async function() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (wishlist.length === 0) {
        $('#wishlistTableBody').html(`
            <tr>
                <td colspan="5" class="text-center py-5">
                    <h4 class="text-muted">Your wishlist is empty</h4>
                    <a href="/" class="btn btn-primary mt-3">Browse Books</a>
                </td>
            </tr>
        `);
        return;
    }

    try {
        const response = await fetch(`https://gutendex.com/books?ids=${wishlist.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch wishlist');

        const data = await response.json();
        displayWishlistedBooks(data.results);
    } catch (error) {
        $('#wishlistTableBody').html(`
            <tr>
                <td colspan="5" class="text-danger">
                    Error loading wishlist. Please try again later.
                </td>
            </tr>
        `);
    }
});

function displayWishlistedBooks(books) {
    wishlistTable.clear();

    books.forEach(book => {
        wishlistTable.row.add({
            title: `<a href="pages/book.html?id=${book.id}">${book.title}</a>`,
            author: book.authors.map(a => a.name).join(', ') || 'Unknown',
            cover: `<img src="${book.formats['image/jpeg'] || '../assets/images/placeholder.jpg'}"
                   class="book-cover img-thumbnail" alt="${book.title}">`,
            genres: book.subjects?.slice(0, 3).join(', ') || 'Not specified',
            id: book.id
        });
    });

    wishlistTable.draw();
}

$('#wishlistTable').on('click', '.wishlist-btn', function() {
    const bookId = parseInt($(this).data('bookId'));
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    wishlist = wishlist.filter(id => id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    const row = $(this).closest('tr');
    wishlistTable.row(row).remove().draw();

    if (wishlist.length === 0) {
        $('#wishlistTableBody').html(`
            <tr>
                <td colspan="5" class="text-center py-5">
                    <h4 class="text-muted">Your wishlist is empty</h4>
                    <a href="/" class="btn btn-primary mt-3">Browse Books</a>
                </td>
            </tr>
        `);
    }
});