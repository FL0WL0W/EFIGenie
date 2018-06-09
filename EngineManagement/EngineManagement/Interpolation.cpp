#include "Interpolation.h"

namespace Interpolation
{
	InterpolationResponse Interpolate(float value, float maxValue, float minValue, unsigned char resolution)
	{
		InterpolationResponse response = { 0, 0, 0 };
		if (resolution > 1)
		{
			float division = (maxValue - minValue) / (resolution - 1);
			response.Multiplier = (value - minValue) / division;
			response.IndexL = response.Multiplier;
			response.Multiplier -= response.IndexL;
			response.IndexH = response.IndexL + 1;
			if (response.IndexL > resolution - 1)
			{
				response.IndexL = response.IndexH = resolution - 1;
			}
			else if (response.IndexH > resolution - 1)
			{
				response.IndexH = resolution - 1;
			}
		}

		return response;
	}
}