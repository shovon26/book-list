const API_URL = 'https://gutendex.com/books';
let currentPage = 1;
let allBooks = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

const booksTableBody = document.getElementById('booksTableBody');
const loadingSpinner = document.getElementById('loadingSpinner');
const searchInput = document.getElementById('searchInput');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const wishlistCount = document.getElementById('wishlistCount');

const booksTable = $('#booksTable').DataTable({
    columns: [
        { data: 'title' },
        { data: 'author' },
        { data: 'cover', orderable: false },
        { data: 'genres' },
        { data: 'id', visible: true },
        { data: 'action', orderable: false }
    ],
    responsive: true
});

async function fetchBooks(page = 1) {
    try {
        loadingSpinner.style.display = 'block';
        const response = await fetch(`${API_URL}?page=${page}`);

        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }

        const data = await response.json();
        allBooks = data.results;
        currentPage = page;
        // console.log({allBooks}, allBooks.length);

        populateGenreFilter(allBooks);
        displayBooks(allBooks);
        updateWishlistCount();

    } catch (error) {
        console.error('Error fetching books:', error);
        booksTableBody.innerHTML = `<tr><td colspan="5" class="text-danger">Error loading books. Please try again.</td></tr>`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function displayBooks(books) {
    booksTable.clear();

    books.forEach(book => {
        const isInWishlist = wishlist.includes(book.id);

        booksTable.row.add({
            title: `<a href="pages/book.html?id=${book.id}">${book.title}</a>`,
            author: book.authors.map(a => a.name).join(', ') || 'Unknown',
            cover: `<img src="${book.formats['image/jpeg'] || 'assets/images/placeholder.jpg'}" 
                   class="book-cover img-thumbnail" alt="${book.title}">`,
            genres: book.subjects?.slice(0, 3).join(', ') || 'Not specified',
            id: book.id,
            action: `<button class="btn btn-sm wishlist-btn ${isInWishlist ? 'active' : ''}" 
                     data-book-id="${book.id}">
                     <i class="fas fa-heart"></i>
                     </button>`
        });
    });

    booksTable.draw();
}

function getAllUniqueGenres(books) {
    const allGenres = new Set();

    books.forEach(book => {
        if (book.subjects) {
            book.subjects.forEach(genre => {
                allGenres.add(genre);
            });
        }
    });

    return Array.from(allGenres).sort();
}

function populateGenreFilter(books) {
    const genreFilter = document.getElementById('genreFilter');
    const uniqueGenres = getAllUniqueGenres(books);

    genreFilter.innerHTML = '<li><a class="dropdown-item active" href="#" data-genre="all">All Genres</a></li>';

    uniqueGenres.forEach(genre => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#" data-genre="${genre}">${genre}</a>`;
        genreFilter.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const genreDropdown = new bootstrap.Dropdown(document.getElementById('genreDropdown'));
    const genreMenu = document.getElementById('genreFilter');
    genreMenu.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (e.target.classList.contains('dropdown-item')) {
            const selectedGenre = e.target.dataset.genre;

            if (e.target.classList.contains('active')) {
                genreDropdown.hide();
                return;
            }

            document.querySelectorAll('#genreFilter .dropdown-item').forEach(item => {
                item.classList.remove('active');
            });
            e.target.classList.add('active');

            document.getElementById('genreDropdown').textContent =
                selectedGenre === 'all' ? 'Filter by Genre' : selectedGenre;

            filterBooksByGenre(selectedGenre);
            genreDropdown.hide();
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            genreDropdown.hide();
        }
    });
});

function filterBooksByGenre(genre) {
    const booksToShow = genre === 'all' ?
        allBooks :
        allBooks.filter(book => book.subjects?.includes(genre));
    displayBooks(booksToShow);
}

function initEventListeners() {
    searchInput.addEventListener('input', (e) => {
        booksTable.search(e.target.value).draw();
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.wishlist-btn');
            const bookId = parseInt(btn.dataset.bookId);
            toggleWishlist(bookId);
            btn.classList.toggle('active');
            updateWishlistCount();
        }
    });
}

function toggleWishlist(bookId) {
    const index = wishlist.indexOf(bookId);
    if (index === -1) {
        wishlist.push(bookId);
    } else {
        wishlist.splice(index, 1);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistCount() {
    wishlistCount.textContent = wishlist.length;
}

if (localStorage.getItem('wishlist')) {
    wishlist = JSON.parse(localStorage.getItem('wishlist'));
    updateWishlistCount();
}

document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => e.preventDefault());
});
async function init() {
    if (window.booksInitialized) return;
    window.booksInitialized = true;

    initEventListeners();
    await fetchBooks();
}

document.addEventListener('DOMContentLoaded', init);