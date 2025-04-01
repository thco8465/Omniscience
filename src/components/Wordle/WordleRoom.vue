<template>
    <div class="container">
        <div class="game-header">
            <h1 class="title">Alpha Arena (Custom Game)</h1>

            <div class="invite-section">
                <input v-model="inviteUsername" class="invite-input" placeholder="Enter username to invite" />
                <button @click="sendInvite" class="invite-btn">Send Invite</button>
                <p v-if="inviteSent" class="invite-status">Invite sent to {{ inviteUsername }}</p>
            </div>

            <div class="invites-section">
                <div class="invites_received">
                    <h2>Invites Received</h2>
                    <ul>
                        <li v-for="invite in invites_received" :key="invite.id" class="invite-item">
                            <span class="invite-username">{{ invite.from_username }}</span>
                            <button @click="acceptInvite(invite)" class="accept-btn">Accept</button>
                            <button @click="declineInvite(invite)" class="decline-btn">Decline</button>
                        </li>
                    </ul>
                </div>

                <div class="invites_sent">
                    <h2>Invites Sent</h2>
                    <ul>
                        <li v-for="invite in invites_sent" :key="invite.id" class="invite-item">
                            <span class="invite-username">{{ invite.to_username }}</span>
                            <span class="invite-status">{{ invite.status }}</span>
                            <button @click="clearSent(invite)" class="clear-btn">Clear</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted} from 'vue';
import { io } from 'socket.io-client';
import { useStore } from "vuex";
import { useRouter } from 'vue-router';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const socket = io(`${API_URL}/wordle`, { transports: ['websocket'] });
const store = useStore();
const router = useRouter();

// Game state
const inviteUsername = ref('');
const inviteSent = ref(false);
const invites_received = ref([])
const invites_sent = ref([])
const username = store.state.user ? store.state.user.username : '';
// Disable button after sending the invite
const sendInvite = () => {
    if (!inviteUsername.value) {
        alert("Please enter a username to invite.");
        return;
    }

    if (!username) {
        alert("You must be signed in.");
        return;
    }

    inviteSent.value = true;
    console.log(inviteUsername.value, username)
    socket.emit("send_invite", {
        to: inviteUsername.value,
        from: username
    });
    console.log('invite sent');
};


const clearSent = (invite) => {
    socket.emit('clearSentInvite', { inviteId: invite.id })

    invites_sent.value = invites_sent.value.filter(i => i.id !== invite.id)
}
const acceptInvite = (invite) => {
    socket.emit("acceptInvite", { inviteId: invite.id })
    updateInviteStatus(invite.id, 'Accepted');
    //router.push('/inviteclash')
}
// Decline an incoming invite
const declineInvite = (invite) => {
    socket.emit('declineInvite', { inviteId: invite.id });
    updateInviteStatus(invite.id, 'Declined');
}

// Update the status of an invite
const updateInviteStatus = (inviteId, status) => {
    const invite = invites_received.value.find(i => i.id === inviteId);
    if (invite) {
        invite.status = status;
    }
}
// Remove the declined invite from the list
const removeDeclinedInvite = (inviteId) => {
    invites_received.value = invites_received.value.filter(i => i.id !== inviteId);
};
// Socket event listeners
onMounted(() => {
    socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('registerUsername', username)
    });
    socket.on("inviteReceived", (invite) => {
        invites_received.value.push(invite);
    })
    socket.on("inviteSent", invite => {
        console.log('invite successfully sent:', invite)
        invites_sent.value.push(invite)
    })
    socket.on('inviteCleared', ({ inviteId }) => {
        console.log(`Invite with ID ${inviteId} has been cleared`)
    })
    socket.on('inviteStatusUpdated', (invite) => {
        if (invite.status === 'Declined') {
            // Remove the declined invite from the list
            const index = invites_sent.value.findIndex(i => i.id === invite.id);
            if (index !== -1) {
                invites_sent.value[index].status = invite.status;
            }
            removeDeclinedInvite(invite.id);
        } else {
            const index = invites_sent.value.findIndex(i => i.id === invite.id);
            if (index !== -1) {
                invites_sent.value[index].status = invite.status;
            }
        }
    });

    socket.on('inviteAccepted', ({ roomId, players }) => {
        // Redirect the sender to the invite clash page
        console.log('other person accepted')
        router.push(`/AlphaCustom?roomId=${roomId}&players=${players.join(',')}`);
    });


    socket.on('invitesReceived', (invitesReceived) => {
        console.log('invites received: ', invitesReceived)
        invites_received.value = invitesReceived.filter(invite => invite.status === 'Pending').slice(0, 10);
    })
    socket.on('invitesSent', (invitesSent) => {
        console.log(invitesSent)
        invites_sent.value = invitesSent.slice(0, 10);
    })

    // Assuming `userName` is your player's username
    if (username) {
        console.log('fetch invites to server')
        socket.emit('fetchInvites', username);
    } else {
        console.log('Username is missing');
    }
});

onUnmounted(() => {
    socket.removeAllListeners();
    socket.disconnect();
    console.log('Component unmounted and cleaned up');
});
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: auto;
    /* Allows the container to grow based on the content */
    min-height: 00vh;
    /* Ensures the container takes at least the full height of the screen */
    padding: 0px 0px;
    background-color: #f0f4f8;
    font-family: 'Arial', sans-serif;
    color: #333;
}

.game-header {
    background-color: #ff7b54;
    border-radius: 10px;
    padding: 20px 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 80%;
    max-width: 800px;
    margin: 20px;
}

.title {
    font-size: 2.5rem;
    color: #fff;
    margin-bottom: 20px;
    font-weight: bold;
}

.invite-section {
    margin-bottom: 20px;
}

.invite-input {
    padding: 10px;
    width: 60%;
    font-size: 1.1rem;
    border: 2px solid #ff7b54;
    border-radius: 5px;
    outline: none;
    margin-right: 10px;
}

.clear-btn {
    background-color: #ff4d4d;
    /* Red color for delete button */
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
}

.clear-btn:hover {
    background-color: #e60000;
    /* Darker red on hover */
}

.invite-btn {
    padding: 10px 20px;
    background-color: #ff7b54;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.invite-btn:disabled {
    background-color: #ddd;
    cursor: not-allowed;
}

.invite-btn:hover {
    background-color: #ff5a2e;
}

.invite-status {
    font-size: 1.1rem;
    color: #4caf50;
    margin-top: 10px;
}

.invites-section {
    margin-top: 30px;
    width: 100%;
}

h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 15px;
    text-transform: uppercase;
}

.invite-item {
    background-color: #fff;
    padding: 15px;
    margin: 10px 0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.invite-username {
    font-size: 1.2rem;
    color: #333;
}

.accept-btn,
.decline-btn {
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
}

.accept-btn {
    background-color: #4caf50;
    color: white;
}

.decline-btn {
    background-color: #f44336;
    color: white;
}

.accept-btn:hover {
    background-color: #45a049;
}

.decline-btn:hover {
    background-color: #d32f2f;
}

.invites_received ul,
.invites_sent ul {
    list-style-type: none;
    padding: 0;
}
</style>