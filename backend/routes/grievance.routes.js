const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Grievance = require('../models/grievance.model');
const User = require('../models/user.model');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX files are allowed.'));
    }
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin or official
const isAdminOrOfficial = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.role === 'admin' || user.role === 'official') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new grievance
router.post('/', verifyToken, upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;
    
    // Get file paths if any
    const attachments = req.files ? req.files.map(file => file.path) : [];
    
    // Create new grievance
    const grievance = new Grievance({
      title,
      description,
      category,
      priority,
      location: location ? JSON.parse(location) : undefined,
      attachments,
      user: req.userId
    });
    
    await grievance.save();
    
    res.status(201).json(grievance);
  } catch (error) {
    console.error('Create grievance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all grievances (with filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, status, priority, search } = req.query;
    const user = await User.findById(req.userId);
    
    // Build query
    let query = {};
    
    // If regular citizen, only show their grievances
    if (user.role === 'citizen') {
      query.user = req.userId;
    }
    
    // Apply filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const grievances = await Grievance.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(grievances);
  } catch (error) {
    console.error('Get grievances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single grievance by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    
    // Check if user has permission to view
    const user = await User.findById(req.userId);
    if (user.role === 'citizen' && grievance.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(grievance);
  } catch (error) {
    console.error('Get grievance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update grievance status
router.put('/:id/status', verifyToken, isAdminOrOfficial, async (req, res) => {
  try {
    const { status, comment } = req.body;
    
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    
    // Update status
    grievance.status = status;
    grievance.updatedAt = Date.now();
    
    // Add comment if provided
    if (comment) {
      grievance.comments.push({
        text: comment,
        user: req.userId
      });
    }
    
    await grievance.save();
    
    res.json(grievance);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign grievance to official
router.put('/:id/assign', verifyToken, isAdminOrOfficial, async (req, res) => {
  try {
    const { officialId } = req.body;
    
    // Check if official exists and has the right role
    const official = await User.findById(officialId);
    if (!official || official.role !== 'official') {
      return res.status(400).json({ message: 'Invalid official' });
    }
    
    const grievance = await Grievance.findByIdAndUpdate(
      req.params.id,
      { 
        assignedTo: officialId,
        status: 'In Progress',
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    
    res.json(grievance);
  } catch (error) {
    console.error('Assign grievance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to grievance
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    
    // Check if user has permission
    const user = await User.findById(req.userId);
    if (user.role === 'citizen' && grievance.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Add comment
    grievance.comments.push({
      text,
      user: req.userId
    });
    
    grievance.updatedAt = Date.now();
    await grievance.save();
    
    // Populate user info in the new comment
    await grievance.populate('comments.user', 'name email');
    
    res.json(grievance.comments[grievance.comments.length - 1]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grievance statistics
router.get('/stats/summary', verifyToken, isAdminOrOfficial, async (req, res) => {
  try {
    const totalGrievances = await Grievance.countDocuments();
    const pendingGrievances = await Grievance.countDocuments({ status: 'Pending' });
    const inProgressGrievances = await Grievance.countDocuments({ status: 'In Progress' });
    const resolvedGrievances = await Grievance.countDocuments({ status: 'Resolved' });
    const rejectedGrievances = await Grievance.countDocuments({ status: 'Rejected' });
    
    // Category distribution
    const categoryDistribution = await Grievance.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Priority distribution
    const priorityDistribution = await Grievance.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    res.json({
      total: totalGrievances,
      statusDistribution: {
        pending: pendingGrievances,
        inProgress: inProgressGrievances,
        resolved: resolvedGrievances,
        rejected: rejectedGrievances
      },
      categoryDistribution,
      priorityDistribution
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
