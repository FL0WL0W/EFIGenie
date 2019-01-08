#include "Interpolation.h"

namespace Interpolation
{
	InterpolationResponse Interpolate(float value, float maxValue, float minValue, unsigned char resolution)
	{
		InterpolationResponse response = { 0, 0, 0 };
		if (resolution > 1)
		{
			resolution -= 1;
			response.Multiplier = resolution * (value - minValue) / (maxValue - minValue);
			if(response.Multiplier < 0)
			{
				response.Multiplier = 0;
			}
			response.IndexL = response.Multiplier;
			response.Multiplier -= response.IndexL;
			response.IndexH = response.IndexL + 1;
			if (response.IndexL > resolution)
			{
				response.IndexL = response.IndexH = resolution;
			}
			else if (response.IndexH > resolution)
			{
				response.IndexH = resolution;
			}
		}

		return response;
	}
}