import React, { useState, useEffect } from 'react';
import { getRequestById, submitReview } from '../services/maintenanceService';
import { useParams } from 'react-router-dom';

const Review = ({ user_id }) => {
    const { requestId } = useParams();
    const [request, setRequest] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');

    useEffect(()=>{
        const fetchRequest = async ()=>{
            const res = await getRequestById(requestId);
            setRequest(res.data);
        }
        fetchRequest();
    },[requestId]);

    const handleSubmit = async e => {
        e.preventDefault();
        await submitReview({ user_id, request_id: requestId, rating, review: reviewText });
        alert('Review submitted!');
    }

    if(!request) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth:'500px', margin:'auto', padding:'10px', border:'1px solid #ccc', borderRadius:'5px' }}>
            <h3>Review Your Maintenance Request</h3>
            <p><b>Service:</b> {request.service}</p>
            <p><b>Description:</b> {request.description}</p>
            <p><b>Technician:</b> {request.technician_name}</p>
            <form onSubmit={handleSubmit}>
                <label>Rating:</label>
                <select value={rating} onChange={e=>setRating(e.target.value)}>
                    {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}
                </select>

                <label>Review:</label>
                <textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Write your review" />

                <button type="submit" style={{ marginTop:'10px' }}>Submit Review</button>
            </form>
        </div>
    );
};

export default Review;
