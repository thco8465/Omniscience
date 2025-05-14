import express from 'express'
import db from '../Database/db.mjs'

const router = express.Router()

router.post('/addEntry', async (req,res) => {
    const {userId, mood, energy, focus, notes} = req.body
    const today = new Date().toISOString().split('T')[0]

    if(!userId || !mood || !energy || !focus){
        return res.status(400).json({error: 'Missing required fields'})
    }

    try{
        const query = `
        insert into user_journal_entries (user_id, entry_date, mood, energy, focus,notes)
        values ($1, $2, $3, $4, $5, $6)
        on conflict (user_id, entry_date)
        do update set mood=$3, energy=$4, focus=$5, notes = $6
        `
        await db.query(query, [userId, today, mood, energy, focus, notes || null])

        res.status(200).json({message: 'Journal entry saved successfully'})
    } catch(error){
        console.error('Error saving journal entry', error)
        res.status(500).json({error: 'Internal server error'})
    }
})

//Get all journal entries for a user
router.get('/entries/:userId', async(req,res) => {
    const {userId} = req.params
    
    try{
        const result = await db.query(
            `select entry_date, mood, energy, focus, notes
            from user_journal_entries where user_id=$1
            order by entry_date desc`,
            [userId]
        )
        console.log(result)
        res.status(200).json(result)
    }catch(error){
        console.error('Error fetching journal entries', error)
        res.status(500).json({error: 'Failed to retrieve journal entries'})
    }
})

export default router