/*
 * Dots Mesh Web App
 * https://github.com/dotsmesh/dotsmesh-web-app
 * Free to use under the GPL-3.0 license.
 */

async (args, library) => {
    var groupID = args.id;

    x.setTemplate('columns-profile');

    x.addErrorHandler(['invalidMemberID', 'invalidAccessKey', 'groupNotFound'], async () => {
        x.showLoading();
        var exists = await x.services.call('groups', 'exists', { groupID: groupID });
        x.hideLoading();
        var options = {};
        if (exists) {
            options.buttonText = 'Remove from your groups';
            options.buttonClick = async () => {
                x.showLoading();
                await x.services.call('groups', 'leave', { groupID: groupID });
                x.hideLoading();
                x.showMessage('Done! Group removed!');
            };
        }
        x.showMessage('The group does not exist or you are not a member!', options);
    });

    x.wait(async () => {
        var profile = await x.group.getProfile(groupID);
        x.setTitle(profile.name + ' (private group)');
    });

    x.add(x.makeProfilePreviewComponent('group', groupID, {
        groupUserID: x.currentUser.getID(),
        showEditButton: async () => {
            var memberGroupDetails = await x.services.call('groups', 'getDetails', { groupID: groupID, details: ['administratorsKeys'] });
            var isAdministrator = memberGroupDetails !== null && memberGroupDetails.administratorsKeys !== null;
            return isAdministrator;
        }
    }), { template: 'column1' });

    var memberGroupDetails = await x.services.call('groups', 'getDetails', { groupID: groupID, details: ['administratorsKeys'] });
    var isAdministrator = memberGroupDetails !== null && memberGroupDetails.administratorsKeys !== null;

    if (isAdministrator) {
        let component = x.makeSecretComponent('Administrators only', async component2 => {
            var sharedDataStorage = await x.group.getSharedDataStorage(groupID); // todo move in library and add cache ???
            var list = await sharedDataStorage.getList({ keyStartWith: 'm/p/', keyEndWith: '/a', limit: 101, sliceProperties: ['key'] });
            var pendingCount = list.length;
            var button = x.makeButton('Pending approval (' + (pendingCount > 100 ? '100+' : pendingCount) + ')', () => {
                x.open('group/members', { id: groupID, mode: 'pendingApproval' });
            });
            component2.add(button);

            var privateDataStorage = await x.group.getFullDataStorage(groupID, 'p/i/'); // todo move in library and add cache ???
            var list = await privateDataStorage.getList({ limit: 101, sliceProperties: ['key'] });
            var invitationsCount = list.length;
            var button = x.makeButton('Invitations (' + (invitationsCount > 100 ? '100+' : invitationsCount) + ')', () => {
                x.open('group/invitations', { id: groupID });
            });
            component2.add(button);
        });
        component.observeChanges(['group/' + groupID + '/members', 'group/' + groupID + '/invitations']);
        x.add(component, { template: 'column1' });
    }

    x.add(x.makeTitle('Recently published'), { template: 'column2' });

    var listComponent = x.makePostsListComponent(async options => {
        var posts = await x.property.getPosts('group', groupID, { order: 'desc', limit: 20, cacheValues: true });
        return posts;
    }, {
        addButton: async () => {
            var memberGroupDetails = await x.services.call('groups', 'getDetails', { groupID: groupID, details: ['status'] });
            if (memberGroupDetails !== null && memberGroupDetails.status === 'joined') {
                return {
                    onClick: () => {
                        x.open('posts/form', { groupID: groupID }, { modal: true });
                    },
                    text: 'New post'
                }
            }
            return null;
        },
        emptyText: 'No posts have been publiblished yet.'
    });
    listComponent.observeChanges(['groups', 'group/' + groupID + '/posts']);
    x.add(listComponent, { template: 'column2' });

    x.addToolbarNotificationsButton('gp$' + groupID, action => {
        return {
            appID: 'group',
            name: 'modifyGroupPostsNotification',
            args: { action: action, groupID: groupID, lastSeenPosts: listComponent.getLastSeen() }
        }
    }, 'Get notified when there is a new post in this group.');
    x.windowEvents.addEventListener('show', async () => {
        await library.updateGroupPostsNotification(groupID, { lastSeenPosts: listComponent.getLastSeen() });
    });

};