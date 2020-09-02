/*
 * Dots Mesh Web App
 * https://github.com/dotsmesh/dotsmesh-web-app
 * Free to use under the GPL-3.0 license.
 */

async (args, library) => {
    var userID = args.userID;

    x.setTitle('Do you have a key?');

    x.add(x.makeText('You\'ll need a key to send your connection request to this profile. This is an anti-spam mechanism.'));

    var fieldKey = x.makeFieldTextbox(null, { placeholder: 'Connection key' });
    x.add(fieldKey);

    x.add(x.makeButton('Send connection request', async () => {
        x.showLoading();
        var result = await library.sendRequest(userID, fieldKey.getValue());
        x.hideLoading();
        if (result === true) {
            x.showMessage('Connection request sent!');
        } else {
            x.showMessage('Sorry! The connection key is not valid!');
        }
    }));
};