document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
        window.location.href = '/';
        return;
    }

    fetchBookDetails(bookId);
});

async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`https://gutendex.com/books/${bookId}`);
        if (!response.ok) {
            throw new Error('Book not found');
        }

        const book = await response.json();
        displayBookDetails(book);
    } catch (error) {
        console.error('Error fetching book:', error);
        document.getElementById('book-details').innerHTML = `
            <div class="alert alert-danger">
                Error loading book details. <a href="/">Return to homepage</a>
            </div>
        `;
    }
}

function displayBookDetails(book) {
    document.getElementById('book-title').textContent = book.title;
    document.getElementById('book-author').textContent =
        book.authors.map(a => a.name).join(', ') || 'Unknown Author';

    document.getElementById('book-summary').textContent =
        book.summaries?.[0] || 'No summary available';

    document.getElementById('book-genres').textContent =
        book.subjects?.join(', ') || 'Not specified';

    document.getElementById('book-language').textContent =
        book.languages?.join(', ') || 'Unknown';

    document.getElementById('book-downloads').textContent =
        book.download_count?.toLocaleString() || '0';

    const coverImg = document.getElementById('book-cover');
    coverImg.src = book.formats['image/jpeg'] || '../assets/images/placeholder.jpg';
    coverImg.alt = `Cover of ${book.title}`;

    const downloadLink = document.getElementById('download-link');
    if (book.formats['text/html']) {
        downloadLink.href = book.formats['text/html'];
        downloadLink.textContent = 'Read Online';
    } else if (book.formats['application/epub+zip']) {
        downloadLink.href = book.formats['application/epub+zip'];
        downloadLink.textContent = 'Download EPUB';
    } else {
        downloadLink.style.display = 'none';
    }
}