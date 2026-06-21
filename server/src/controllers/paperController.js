const cloudinary = require('../config/cloudinary');
const Paper = require('../models/Paper');
const Project = require('../models/Project');

const uploadPaper = async (req, res) => {
  try {
    const { title, authors, year, keywords, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'title and projectId are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isLeader = project.leader.toString() === req.user._id.toString();
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());

    if (!isLeader && !isMember) {
      return res.status(403).json({ message: 'Not authorized to upload to this project' });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `papertrail/${projectId}`,
          public_id: `${Date.now()}_${req.file.originalname}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const parsedAuthors = authors ? (typeof authors === 'string' ? authors.split(',').map(a => a.trim()) : authors) : [];
    const parsedKeywords = keywords ? (typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords) : [];

    const paper = await Paper.create({
      title,
      authors: parsedAuthors,
      year: year || undefined,
      keywords: parsedKeywords,
      projectId,
      uploadedBy: req.user._id,
      pdfUrl: result.secure_url,
    });

    res.status(201).json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProjectPapers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const papers = await Paper.find({ projectId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    const project = await Project.findById(paper.projectId);
    const isLeader = project.leader.toString() === req.user._id.toString();
    const isUploader = paper.uploadedBy.toString() === req.user._id.toString();

    if (!isLeader && !isUploader) {
      return res.status(403).json({ message: 'Not authorized to delete this paper' });
    }

    const publicId = paper.pdfUrl.split('/').slice(-2).join('/').split('.')[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    await Paper.findByIdAndDelete(req.params.id);

    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadPaper, getProjectPapers, deletePaper };
