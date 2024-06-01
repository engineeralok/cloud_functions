import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as bcrypt from "bcrypt";

admin.initializeApp();

export const createUserWithCustomClaims = functions.https.onRequest(async (req, res): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    var { phoneNumber, password, role } = req.body;

    const validRoles = ['admin', 'user', 'manager'];

    if (!phoneNumber || !password || !role || !validRoles.includes(role)) {
        res.status(400).send('Missing or invalid parameters: phoneNumber, password, and role');
        return;
    }

    phoneNumber = `${phoneNumber}`

    try {
        const tempEmail = `${phoneNumber}@some`;

        const userRecord = await admin.auth().createUser({
            email: tempEmail,
            password: password,
            emailVerified: false,
            disabled: false,
            phoneNumber: phoneNumber,
        });

        const customClaims = { role };

        await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);

        res.status(200).send({
            uid: userRecord.uid,
            phoneNumber: userRecord.phoneNumber,
            email: userRecord.email,
            role: customClaims.role
        });
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).send('Internal server error');
    }
});


export const loginUser = functions.https.onRequest(async (req, res): Promise<void> => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
        res.status(400).send('Missing parameters: phoneNumber and password are required');
        return;
    }

    const formattedPhoneNumber = `${phoneNumber}`;

    try {
        const userRecord = await admin.auth().getUserByPhoneNumber(formattedPhoneNumber);

        // admin.auth().

        // userRecord.passwordHash
        
        //     res.status(200).send(userRecord);
        //     return;
        
            

        // const user = await admin.auth().getUser(userRecord.uid);

        if (!userRecord) {
            res.status(404).send('User not found' + `$user`);
            return;
        }

        var userData = userRecord;
        const isPasswordValid = await bcrypt.hash(password, userData.passwordSalt!);

        res.send(200).send(isPasswordValid);

        // if (!isPasswordValid) {+

             
        //     res.status(401).send('Invalid password');
        //     return;
        // }

        // const customToken = await admin.auth().createCustomToken(userRecord.uid);
        // res.status(200).send({ token: customToken });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Internal server error');
    }
});