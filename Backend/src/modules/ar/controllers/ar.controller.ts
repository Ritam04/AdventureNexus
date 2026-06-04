import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from '../../../shared/utils/logger';
import getFullURL from '../../../shared/services/getFullURL.service';

const locationDatabase: Record<string, {
    name: string;
    imageUrl: string;
    description: string;
    suggestedAngle: string;
    backgroundUrl: string;
}> = {
    tajmahal: {
        name: "Taj Mahal",
        description: "An ivory-white marble mausoleum on the Yamuna river bank in Agra, India, built by Emperor Shah Jahan.",
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Align camera 15° upward. Position base along grid horizon. Shoot during sunrise for warm pink-glow highlights."
    },
    eiffeltower: {
        name: "Eiffel Tower",
        description: "A historic wrought-iron lattice tower on the Champ de Mars in Paris, France, named after engineer Gustave Eiffel.",
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1499856871958-5b9647a64bc8?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Angle up 30° from the Champ de Mars gardens. Keep tower centered to match architectural symmetry."
    },
    colosseum: {
        name: "Colosseum",
        description: "The largest ancient amphitheatre ever built, situated in Rome, Italy. An iconic symbol of imperial Roman architecture.",
        imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1515542690876-879e0a35282b?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Align outer wall arches with the camera's rule-of-thirds grid. Frame from the East for soft golden afternoon light."
    },
    mountfuji: {
        name: "Mount Fuji",
        description: "An active stratovolcano located 100 kilometers southwest of Tokyo, Japan. Sacred site and national symbol of Japan.",
        imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Align volcano peak with the center vertical line. Target morning hours for clear skies and crisp snow-cap contrast."
    },
    greatwall: {
        name: "Great Wall of China",
        description: "A monumental series of ancient fortifications winding across northern China's ridges, built to protect historical borders.",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=600&auto=format&fit=crop",
        backgroundUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop",
        suggestedAngle: "Tilt 10° along the slope of the steps. Keep the watchtower in the right third of your preview view."
    }
};

export const getARLocationController = async (req: Request, res: Response) => {
    const fullUrl = getFullURL(req);
    try {
        const nameQuery = req.query.name as string;

        if (!nameQuery) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: 'Failed',
                message: 'Parameter "name" is required'
            });
        }

        const normalizedKey = nameQuery.toLowerCase().replace(/[\s_]/g, '');
        const destination = locationDatabase[normalizedKey];

        if (!destination) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: 'Failed',
                message: `AR assets not found for: ${nameQuery}`
            });
        }

        logger.info(`URL: ${fullUrl} - AR Assets loaded for ${destination.name}`);
        return res.status(StatusCodes.OK).json({
            status: 'Success',
            data: destination
        });
    } catch (error: any) {
        logger.error(`URL: ${fullUrl}, error_message: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'Failed',
            message: 'Internal server error occurred'
        });
    }
};
