#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatInputService.h"
#include "math.h"
#include "Packed.h"
#include "Interpolation.h"

using namespace HardwareAbstraction;

#if !defined(FLOATINPUTSERVICE_FREQUENCYINTERPOLATEDTABLE_H) && defined(IFLOATINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define FLOATINPUTSERVICE_FREQUENCYINTERPOLATEDTABLE_H
namespace IOServices
{
	PACK(
	struct FloatInputService_FrequencyInterpolatedTableConfig
	{
	private:
		FloatInputService_FrequencyInterpolatedTableConfig()
		{
			
		}
		
	public:
		static FloatInputService_FrequencyInterpolatedTableConfig* Cast(void *p)
		{
			FloatInputService_FrequencyInterpolatedTableConfig *ret = (FloatInputService_FrequencyInterpolatedTableConfig *)p;

			ret->Table = (float *)(ret + 1);

			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(FloatInputService_FrequencyInterpolatedTableConfig) +
				(sizeof(float) * Resolution);
		}

		unsigned char PwmPin;
		unsigned short MinFrequency;
		unsigned short MaxFrequency;
		unsigned short DotSampleRate;
		unsigned char Resolution;
		float *Table;
	});
	
	class FloatInputService_FrequencyInterpolatedTable : public IFloatInputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatInputService_FrequencyInterpolatedTableConfig *_config;
		
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
		
	public:
		FloatInputService_FrequencyInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_FrequencyInterpolatedTableConfig *config);

		void ReadValue();
	};
}
#endif