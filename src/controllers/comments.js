const Bar = require("../models/Bar");

exports.addComment = async (req, res) => {
  const { barId } = req.params;
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status.json({ error: "Author and content" });
  }

  try {
    const bar = await Bar.findById(barId);

    if (!bar) {
      return res.status(404).json({ error: "Bar not found" });
    }

    const newComment = { author, content };

    bar.comments.push(newComment);

    await bar.save();

    res
      .status(201)
      .json({ message: "comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500);
  }
};

exports.getComments = async (req, res) => {
  const { barId } = req.params;

  try {
    const bar = await Bar.findOne({ place_id: barId }).select("comments");

    if (!bar) {
      return res.status(404).json({ error: "bar not found" });
    }

    res.json(bar.comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};
