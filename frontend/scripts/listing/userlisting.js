let token = null;
window.onload = function () {
    token = sessionStorage.getItem("token");
    console.log(sessionStorage);

    userId = 2;

    if (userId) {
        fetch(`https://bookbarter-main2.onrender.com/user/getFirstname/${userId}`, {
            method: "GET",
            // body: JSON.stringify({ userId: userId }),
            headers: {
                "Content-Type": "application/json",
                authorization: `${token}`,
            },
        })
            .then((response) => response.json())
            .then((userDetails) => displayUserDetails(userDetails))
            //.then(bookDetails => displayBooks(bookDetails))
            .catch(console.error);
    } else {
        console.error("User ID not found");
    }

    if (userId) {
        fetch(`https://bookbarter-main2.onrender.com/booklisting/getBookbyUserid/${userId}`, {
            method: "GET",
            // body: JSON.stringify({ userId: userId }),
            headers: {
                "Content-Type": "application/json",
                authorization: `${token}`,
            },
        })
            .then((response) => response.json())
            .then((books) => populateBookDropdown(books))
            //.then(bookDetails => displayBooks(bookDetails))
            .catch(console.error);
    } else {
        console.error("User ID not found");
    }
};

function displayUserDetails(userDetails) {
    console.log(userDetails);
    document.getElementById("userName").value = userDetails.first_name; // Adjust depending on the structure of userDetails
}

function populateBookDropdown(bookDetails) {
    const select = document.getElementById("bookName");
    select.innerHTML = ""; // Clear existing options if any
    bookDetails.forEach((book) => {
        let option = document.createElement("option");
        option.value = book.id; // Assuming book has an 'id'
        option.textContent = book.title; // Adjust if your book detail structure is different
        select.appendChild(option);
    });
}

function submitListing(event) {
    event.preventDefault(); // Prevent the default form submission

    const bookId = document.getElementById("bookName").value;
    const userId = 2;
    console.log(bookId);
    const bookName = document.getElementById("bookName");
    console.log(userId);
    const currentStatus = document.getElementById("bookStatus").value;
    //const newStatus = currentStatus === 'Available' ? 'NotAvailable' : 'available';
    console.log(currentStatus);
    if (currentStatus === "available") {
        fetch(`https://bookbarter-main2.onrender.com/booklisting/updateAvailableBooks`, {
            method: "PUT",
            // body: JSON.stringify({ userId: userId }),
            headers: {
                "Content-Type": "application/json",
                authorization: `${token}`,
            },
            body: JSON.stringify({
                book_id: bookId,
                owner_id: userId,
            }),
        })
            .then((response) => response.json())
            .then((updateStatus) => {
                console.log("Update success:", updateStatus);
                alert(`The book is now Available for exchange.`);
                // Handle success response (e.g., updating UI or displaying a success message)
            })
            .catch(console.error);
    } else {
        fetch(`https://bookbarter-main2.onrender.com/booklisting/updateNotAvailableBooks`, {
            method: "PUT",
            // body: JSON.stringify({ userId: userId }),
            headers: {
                "Content-Type": "application/json",
                authorization: `${token}`,
            },
            body: JSON.stringify({
                book_id: bookId,
                owner_id: userId,
            }),
        })
            .then((response) => response.json())
            .then((updateStatus) => {
                console.log("Update success:", updateStatus);
                alert(`The book is now Not Available for exchange.`);
                // Handle success response (e.g., updating UI or displaying a success message)
            })
            .catch(console.error);
    }
}
