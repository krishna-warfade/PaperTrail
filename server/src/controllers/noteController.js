const Note = require('../models/Note');

exports.addNote = async (req, res) => {
  try {
    const { paperId, content } = req.body;

    if (!paperId || !content) {
      return res.status(400).json({ message: 'paperId and content are required' });
    }

    const note = await Note.create({
      paperId,
      authorId: req.user._id,
      content,
    });

    return res.status(201).json(note);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add note', error: err.message });
  }
};

exports.getNotesForPaper = async (req, res) => {
  try {
    const { paperId } = req.params;

    const notes = await Note.find({ paperId })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(notes);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own notes' });
    }

    note.content = content ?? note.content;
    await note.save();

    return res.status(200).json(note);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update note', error: err.message });
  }
};