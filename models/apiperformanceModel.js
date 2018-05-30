import mongoose from 'mongoose';

const apiperformance = new mongoose.Schema({
    any: mongoose.Schema.Types.Mixed
}, {
    strict: false
});

const apiperformanceModel = mongoose.model('apiperformance', apiperformance, 'apiperformance');
export default apiperformanceModel;