const db = require("../db");
const bcrypt = require("bcrypt");

async function validateUserId(userId) {
    const result = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
    return result.rowCount != 0;
}

async function validateAddress(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.status === "OK") {
        const location = result.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
        return { latitude, longitude };
    } else {
        return false;
    }
}

async function validateAddress(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
    )}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const result = await response.json();

    if (result.status === "OK") {
        const location = result.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
        return { latitude, longitude };
    } else {
        return false;
    }
}

// needs error handling for duplicate keys
async function create(
    user_id,
    password_hash,
    email,
    phone_number,
    address,
    first_name,
    last_name,
    latitude,
    longitude,
    is_auth,
) { 
    try {
        const result = await db.query(
            "INSERT INTO users(user_id, password_hash, email, phone_number, address, first_name, last_name, latitude, longitude, is_auth) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
            [
                user_id,
                password_hash,
                email,
                phone_number,
                address,
                first_name,
                last_name,
                latitude,
                longitude,
                false,
            ],
        );
        return result;
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            throw new Error(
                "User with the same user_id, email or phone number already exists",
            );
        } else {
            throw error;
        }
    }
}

async function updateUserInfo(
    user_id,
    email,
    phone_number,
    address,
    first_name,
    last_name,
    latitude,
    longitude,
    is_auth,
    password_hash,
    original_user_id,
) {
    try {
        // Check if the new email or phone number already exists in the database for other users.
        const checkDuplicateQuery = `
            SELECT user_id
            FROM users
            WHERE (email = $1 OR phone_number = $2) AND user_id != $3
        `;

        const duplicateCheckResult = await db.query(checkDuplicateQuery, [
            email,
            phone_number,
            user_id,
        ]);

        if (duplicateCheckResult.length > 0) {
            throw new Error("Duplicate email or phone number found");
        }

        // Update the user's information.
        const updateQuery = `
        UPDATE users
        SET
            email = COALESCE($1, email),
            phone_number = COALESCE($2, phone_number),
            address = COALESCE($3, address),
            first_name = COALESCE($4, first_name),
            last_name = COALESCE($5, last_name),
            latitude = COALESCE($6, latitude),
            longitude = COALESCE($7, longitude),
            is_auth = COALESCE($8, is_auth),
            password_hash = COALESCE($9, password_hash),
            last_updated_on = current_timestamp
        WHERE user_id = $10
        RETURNING *
        `;

        const result = await db.query(updateQuery, [
            email,
            phone_number,
            address,
            first_name,
            last_name,
            latitude,
            longitude,
            is_auth,
            password_hash,
            user_id,
        ]);
        console.log("Result is" + result.email);
        if (result.length === 0) {
            throw new Error("User not found");
        }

        return result[0];
    } catch (error) {
        throw error;
    }
}

async function login(user_id, password) {
    const result = await db.query("SELECT * FROM users WHERE user_id = ?", [
        user_id,
    ]);

    if (result.length === 0) {
        // User not found
        return null;
    }  
    const user = result[0];
    console.log(user)
    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log(passwordMatch);  
    if (passwordMatch) { 
        // Passwords match, user is authenticated
        return user;
    }
}

async function getUsername(id) {
    const result = await db.query("SELECT user_id FROM users WHERE id = ?", [
        id,
    ]);
    if (result.length === 0) {
        // User not found
        return null;
    }
    const user = result[0];
    return user;
}

async function getUserDetails(user_id) {
    const result = await db.query("SELECT * FROM users WHERE user_id = ?", [
        user_id,
    ]);
    if (!result) {
        // User not found
        return null;
    }
    const user = result[0];
    return user;
}

async function getUserInfo() {
    const query = `SELECT id,created_on,last_updated_on,user_id,email,phone_number,first_name,last_name,latitude,longitude,is_auth,is_admin from users`;
    const result = await db.query(query);
    console.log(result);
    if (result) {
        return result;
    } else {
        return null;
    }
}

async function getRequestInfo() {
    const query = `SELECT * FROM REQUEST`;
    const result = await db.query(query);
    if (result) {
        return result;
    } else { 
        return null;
    }
    return result;
}

async function getUserIdfromEmail(email) {
    const result = await db.query("SELECT id FROM users WHERE email = $1", [
        email,
    ]);
    console.log(result);
    if (!result) {
        // User not found
        return null;
    }
    const user_id = result;
    console.log(user_id);
    return user_id;
}

async function getUserFirstName(id) {
    const result = await db.query(
        "SELECT first_name FROM users WHERE id = $1",
        [id],
    );
    if (!result) {
        // User not found
        return null;
    }
    const user = result;
    return user;
}

async function deleteUserById(id) {
    try {
        const result = await new Promise((resolve, reject) => {
            db.query("DELETE FROM users WHERE id = ?", [id], function (error) {
                if (error) {
                    reject(error);
    } else {
            console.log("Successfully Deleted user ", id);
            resolve({ changes: this.changes });
            }
        });
        });
        return result;
    } catch (error) {
        console.log("Error while performing delete operation on ", id, error);
        throw error;
    }
    }


    async function getAdmin(id){
        console.log(id);
    const result = await db.query('SELECT IS_ADMIN FROM USERS WHERE ID = $1;', [id]);
    //console.log(result);
    if (result && result[0].is_admin==1) {
        console.log(result);
        return result[0].is_admin === 1; 
    } else {
        return false; 
    }
}

module.exports = {
    validateUserId,
    validateAddress,
    create,
    login,
    updateUserInfo,
    getUserIdfromEmail,
    getUsername,
    getUserDetails,
    getUserFirstName,
    getUserInfo,
    getRequestInfo,
    deleteUserById,getAdmin,
};
