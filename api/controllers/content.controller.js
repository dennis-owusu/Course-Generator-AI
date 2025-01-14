import Content from "../models/content.model.js";

export const createContent = async(req, res, next) => {

    const {name, duration, level, description, youtubeVideoUrl, chapters} = req.body;

    try {
        const newContent = await Content({
            name,
            duration,
            level,
            description,
            youtubeVideoUrl,
            chapters
        });  
        await newContent.save();
        res.status(200).json({message: 'Content created successfully'});
    } catch (error) {
        next(error)
    }

}