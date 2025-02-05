const Bar = require("../models/Bar");

exports.addTag = async (req, res) => {
  const { barId } = req.params;
  const tag = req.body;

  try {
    const bar = await Bar.findOne({ place_id: barId });

    if (!bar) {
      return res.status(404).json({ error: "Bar not found" });
    }

    const updatedTag = bar.tags.find((t) => t.tagName === tag.tagName);

    updatedTag.tagCount = (updatedTag.tagCount || 0) + 1;

    await bar.save();

    res.status(201).json({ message: "tag added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to add tag" });
  }
};

exports.getTags = async (req, res) => {
  const { barId } = req.params;

  try {
    const bar = await Bar.findOne({ place_id: barId }).select("tags");

    if (!bar) {
      return res.status(404).json({ error: "bar not found" });
    }

    res.json(bar.tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};
