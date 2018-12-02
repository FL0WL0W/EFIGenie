#include "math.h"

#ifndef INTERPOLATION_H
#define INTERPOLATION_H
namespace Interpolation
{
	struct InterpolationResponse
	{
		float Multiplier;
		unsigned char IndexL;
		unsigned char IndexH;
	};

	InterpolationResponse Interpolate(float value, float maxValue, float minValue, unsigned char resolution);
	
	template<typename K>
		K InterpolateTable1(float value, float maxValue, float minValue, unsigned char resolution, K* table)
		{
			return InterpolateTable1<K>(Interpolate(value, maxValue, minValue, resolution), table);
		}
	
	template<typename K>
		K InterpolateTable1(InterpolationResponse interpolation, K* table)
		{
			K testValue = 0.5;
			if(testValue == 0)
			{
				return round(table[interpolation.IndexL] * (1 - interpolation.Multiplier) + table[interpolation.IndexH] * interpolation.Multiplier);
			}

			return table[interpolation.IndexL] * (1 - interpolation.Multiplier) + table[interpolation.IndexH] * interpolation.Multiplier;
		}
	
	template<typename K>
		K InterpolateTable2(float valueX, float maxValueX, float minValueX, unsigned char resolutionX, float valueY, float maxValueY, float minValueY, unsigned char resolutionY, K* table)
		{
			return InterpolateTable2<K>(Interpolate(valueX, maxValueX, minValueX, resolutionX), resolutionX, Interpolate(valueY, maxValueY, minValueY, resolutionY), table);
		}
	
	template<typename K>
		K InterpolateTable2(InterpolationResponse interpolationX, unsigned char resolutionX, InterpolationResponse interpolationY, K* table)
		{
			K testValue = 0.5;
			if(testValue == 0)
			{
				return	round(		table[interpolationX.IndexL + resolutionX * interpolationY.IndexL] * (1 - interpolationX.Multiplier) * (1 - interpolationY.Multiplier)
				+					table[interpolationX.IndexH + resolutionX * interpolationY.IndexL] * interpolationX.Multiplier * (1 - interpolationY.Multiplier)
				+					table[interpolationX.IndexL + resolutionX * interpolationY.IndexH] * (1 - interpolationX.Multiplier) * interpolationY.Multiplier
				+					table[interpolationX.IndexH + resolutionX * interpolationY.IndexH] * interpolationX.Multiplier * interpolationY.Multiplier);
			}

			return				table[interpolationX.IndexL + resolutionX * interpolationY.IndexL] * (1 - interpolationX.Multiplier) * (1 - interpolationY.Multiplier)
			+					table[interpolationX.IndexH + resolutionX * interpolationY.IndexL] * interpolationX.Multiplier * (1 - interpolationY.Multiplier)
			+					table[interpolationX.IndexL + resolutionX * interpolationY.IndexH] * (1 - interpolationX.Multiplier) * interpolationY.Multiplier
			+					table[interpolationX.IndexH + resolutionX * interpolationY.IndexH] * interpolationX.Multiplier * interpolationY.Multiplier;
		}
}
#endif