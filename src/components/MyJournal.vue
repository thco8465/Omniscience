<template>
    <div class="journal-wrapper">
        <!-- Sidebar: Past Entries -->
        <aside class="journal-tabs">
            <h2>My Entries</h2>
            <ul>
                <li v-for="entry in sortedEntries" :key="entry.entry_date" class="entry-tab"
                    :class="{ active: selectedEntry?.entry_date === entry.entry_date }" @click="toggleEntry(entry)">

                    <div class="entry-date">{{ formatDate(entry.entry_date) }}</div>

                    <transition name="fade">
                        <div v-if="expandedEntry?.entry_date === entry.entry_date" class="entry-summary">
                            <p><strong>Mood:</strong> {{ entry.mood }}</p>
                            <p><strong>Energy:</strong> {{ entry.energy }}</p>
                            <p><strong>Focus:</strong> {{ entry.focus }}</p>
                            <p v-if="entry.notes"><strong>Notes:</strong> {{ entry.notes }}</p>
                        </div>
                    </transition>
                </li>
            </ul>

        </aside>
        <div class="journal-section">
            <div class="journal-content">
                <h1>Brain Health Journal</h1>

                <form @submit.prevent="submitEntry">
                    <div class="slider-group" v-for="(value, key) in journal" :key="key">
                        <label :for="key">{{ keyLabels[key] }}: {{ value }}</label>
                        <input type="range" :id="key" v-model="journal[key]" min="1" max="10" />
                        <small>1 = Low, 10 = High</small>
                    </div>

                    <div class="notes-section">
                        <label for="notes">Optional Notes</label>
                        <textarea id="notes" v-model="notes" placeholder="Any thoughts for today?" rows="3"></textarea>
                    </div>

                    <button type="submit" class="submit-button">Save Entry</button>

                    <transition name="fade">
                        <div v-if="submitted" class="confirmation-message">
                            ✅ Entry saved for today!
                        </div>
                    </transition>
                </form>

                <!-- Display Selected Entry -->
                <div v-if="selectedEntry" class="entry-details">
                    <h2>Entry for {{ formatDate(selectedEntry.date) }}</h2>
                    <ul>
                        <li><strong>Mood:</strong> {{ selectedEntry.mood }}</li>
                        <li><strong>Energy:</strong> {{ selectedEntry.energy }}</li>
                        <li><strong>Focus:</strong> {{ selectedEntry.focus }}</li>
                        <li v-if="selectedEntry.notes"><strong>Notes:</strong> {{ selectedEntry.notes }}</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex';

import axios from 'axios'

const store = useStore();

const userId = computed(() => store.state.user?.id || -1);
const journal = ref({ mood: 5, energy: 5, focus: 5 })
const keyLabels = { mood: 'Mood', energy: 'Energy', focus: 'Focus' }
const notes = ref('')
const submitted = ref(false)

const entries = ref([])
const selectedEntry = ref(null)
const expandedEntry = ref(null)

const today = new Date().toISOString().split('T')[0]

onMounted(async () => {

    if (userId.value !== -1) {
        await fetchEntries()
        const todayEntry = entries.value.find(e => e.entry_date === today)
        if (todayEntry) {
            journal.value = {
                mood: todayEntry.mood,
                energy: todayEntry.energy,
                focus: todayEntry.focus
            }
            notes.value = todayEntry.notes
            selectedEntry.value = todayEntry
        }
    }
})

async function fetchEntries() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    try {
        const res = await axios.get(`${API_URL}/journal/entries/${userId.value}`)
        console.log(res.data)
        entries.value = res.data
    } catch (err) {
        console.error('Failed to fetch journal entries:', err)
    }
}

async function submitEntry() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
        await axios.post(`${API_URL}/journal/addEntry`, {
            userId: userId.value,
            mood: journal.value.mood,
            energy: journal.value.energy,
            focus: journal.value.focus,
            notes: notes.value
        })

        // Refresh entries and mark submission
        await fetchEntries()
        selectedEntry.value = entries.value.find(e => e.entry_date === today)
        submitted.value = true
        setTimeout(() => (submitted.value = false), 3000)
        notes.value = ''
    } catch (err) {
        console.error('Failed to save journal entry:', err)
    }
}

function selectEntry(entry) {
    selectedEntry.value = entry
}
function toggleEntry(entry) {
    expandedEntry.value = expandedEntry.value?.entry_date === entry.entry_date ? null : entry
    selectedEntry.value = entry
}
const sortedEntries = computed(() =>
    [...entries.value].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
)

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}
</script>



<style scoped>
.journal-section {
    background: #ffffff;
    border: 2px solid #4a90e2;
    border-radius: 12px;
    padding: 24px;
    max-width: 600px;
    margin: 40px auto;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.journal-content h1 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 24px;
}

.slider-group {
    margin-bottom: 20px;
    text-align: left;
}

.slider-group label {
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
    color: #333;
}

.slider-group input[type="range"] {
    width: 100%;
}

.slider-group small {
    color: #777;
    font-size: 0.85rem;
}

.notes-section {
    margin-top: 20px;
    text-align: left;
}

.notes-section label {
    font-weight: 600;
    display: block;
    margin-bottom: 6px;
    color: #333;
}

.notes-section textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #aaa;
    border-radius: 6px;
    resize: none;
    font-family: inherit;
}

.submit-button {
    margin-top: 20px;
    background-color: #4a90e2;
    color: #fff;
    border: none;
    padding: 10px 18px;
    font-size: 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.submit-button:hover {
    background-color: #357acb;
}

.confirmation-message {
    margin-top: 20px;
    color: green;
    font-weight: 600;
    font-size: 1rem;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.journal-wrapper {
    display: flex;
    gap: 20px;
    max-width: 1000px;
    margin: 40px auto;
}

.journal-tabs {
    min-width: 160px;
    background: #f3f7ff;
    border: 2px solid #4a90e2;
    border-radius: 12px;
    padding: 16px;
    height: fit-content;
}

.journal-tabs h2 {
    font-size: 1.1rem;
    margin-bottom: 12px;
    color: #333;
}

.journal-tabs ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.journal-tabs li {
    padding: 8px 10px;
    margin-bottom: 6px;
    border-radius: 6px;
    background-color: #e4ecfa;
    cursor: pointer;
    transition: 0.2s;
}

.journal-tabs li:hover {
    background-color: #c7dbfa;
}

.journal-tabs li.active {
    background-color: #4a90e2;
    color: white;
    font-weight: bold;
}

.entry-details {
    margin-top: 30px;
    text-align: left;
    border-top: 1px solid #ccc;
    padding-top: 20px;
}

.entry-details h2 {
    font-size: 1.2rem;
    margin-bottom: 12px;
    color: #333;
}

.entry-details ul {
    list-style: none;
    padding: 0;
}

.entry-details li {
    margin-bottom: 8px;
}
</style>