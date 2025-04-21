let token = null;

window.onload = function () {
    token = sessionStorage.getItem("token");
    user = sessionStorage.getItem("user_id")
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get("id");
    if (bookId) {
        fetch(`http://localhost:8000/book/get/${bookId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "authorization": token,
            },
        })
            .then((response) => response.json())
            .then((bookDetails) => displayBookDetails(bookDetails))
            .catch(console.error);
    } else {
        console.error("Book ID not found");
    }
};

function displayBookDetails(bookDetails) {
    const booklistingDiv = document.getElementById("book-details");
    const bookID = bookDetails.book.id;
    booklistingDiv.innerHTML = "";
    const bookInfo = document.createElement("div");
    bookInfo.innerHTML = `
    <div style="display: flex; align-items: flex-start;">
        <img src="${bookDetails.book.image_url}" style="height: 250px; width: 250px; margin-right: 20px;" alt="${bookDetails.book.title}">
        <span>
            <h3>${bookDetails.book.title}</h3>
            <p><strong>Author: </strong>${bookDetails.book.author}</p>
            <p><strong>Rating: </strong>${bookDetails.book.rating}</p>
            <p><strong>Description: </strong>${bookDetails.book.description}</p>
            
        </span>
    </div>
    `;
    booklistingDiv.appendChild(bookInfo);
    if (bookDetails.visitor) {
        console.log("You're a visitor");
        const visitorDiv = document.createElement("visitorPrompt");
        visitorDiv.className = "visitor-prompt";
        visitorDiv.innerHTML = `
            <div style="border: 1px solid #ddd;
            padding: 10px;
            margin: 10px;
            background-color: #f8f8f8;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
            border-radius: 4px;">
                <h4>We have ${bookDetails.userCount} user(s) eager to lend you this book. Log in to know more!</h4>
                <button class="btn btn-primary" onclick="window.location.href='../create/create.html'">Sign up</button> Or
                <button class="btn btn-primary" id="loginButton" onclick="window.location.href='../login/login.html'">LogIn</button>
            </div>
        `
        booklistingDiv.appendChild(visitorDiv);
    } else {
        console.log(bookDetails.users);
        bookDetails.users.forEach((user) => {
            //usersListHTML += `<li>${user.first_name} ${user.last_name} - ${user.email}</li>`;
            const actionDiv = document.createElement("div");
            actionDiv.className = "action-card";
            //const userName = await getUserNameFromIdAPI(act.borrower_id);
            //const bookName = await getBookNameFromListingIdAPI(act.book_listing_id);

            actionDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4>User ${user.user_id} has book Available</h4>
                    <button data-id="${user.id}" class="btn approve-request-btn">Raise Request</button>
                </div>
            `;

            booklistingDiv.appendChild(actionDiv);
            const requestButton = actionDiv.querySelector(".approve-request-btn");
            requestButton.addEventListener("click", function () {
                raiseRequest(user.id, user.listingId, bookID); // Pass the user ID and the book ID to the raiseRequest function
            });
        });
    }
}

function raiseRequest(userId, listingId, bookId) {
    console.log(userId,listingId,bookId)
    const url = "http://localhost:8000/requests/raiseBorrowRequest";
    const data = {
        borrowDuration: "5",
        listingId: listingId,
    };

    fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'authorization': `${token}`
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (!response.ok) {

                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((jsonResponse) => {
            console.log("Request creation success:", jsonResponse);

            fetch(`http://localhost:8000/booklisting/updateBookStatus`, {
                method: "PUT",
                // body: JSON.stringify({ userId: userId }),
                headers: {
                    "Content-Type": "application/json",
                    authorization: `${token}`,
                },
                body: JSON.stringify({

                    book_id: bookId,
                    owner_id: userId,
                    status: "Not_Available",
                }),
            })
                .then((response) => response.json())
                .then((updateStatus) => {
                    console.log("Update success:", updateStatus);
                })
                .catch(console.error);

            alert("Request is raised successfully!"); // Show an alert for successful request
            window.location.reload();
        })
        .catch((error) => {

            console.error("Request creation failed:", error);
            alert("There was an error raising the request."); // Show an alert for a failed request
        });
}

function requestBook(userId) {
    console.log(`Requesting book from user with ID: ${userId}`);
}
