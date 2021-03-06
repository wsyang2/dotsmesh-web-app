/*
 * Dots Mesh Web App
 * https://github.com/dotsmesh/dotsmesh-web-app
 * Free to use under the GPL-3.0 license.
 */

async (args, library) => {

    x.setTitle('Feedback');

    x.add(x.makeText('Help make Dots Mesh even more awesome. Your ideas and suggestions are highly appreciated.'));

    var fieldFeedback = x.makeFieldTextarea('', { placeholder: 'Your feedback' });
    x.add(fieldFeedback);

    x.add(x.makeHint('No additional or identifiable information will be sent.'));

    x.add(x.makeButton('Send', async () => {
        x.showLoading();
        try {
            await fetch('https://about.dotsmesh.com/submitFeedback', {
                method: 'POST',
                cache: 'no-cache',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                referrerPolicy: 'no-referrer',
                body: JSON.stringify({ content: fieldFeedback.getValue() })
            });
        } catch (e) {

        }
        x.showMessage('Your feedback is successfully submitted! Thank you!');
        x.hideLoading();
    }));
};