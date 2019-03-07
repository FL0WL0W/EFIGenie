#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatInputService.h"
#include "math.h"
#include "Packed.h"
#include "Interpolation.h"
#include "stdint.h"

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
		constexpr const unsigned int Size() const
		{
			return sizeof(FloatInputService_FrequencyInterpolatedTableConfig) +
				(sizeof(float) * Resolution);
		}

		constexpr const float *Table() const { return reinterpret_cast<const float *>(this + 1); }

		uint16_t PwmPin;
		uint16_t DotSampleRate;
		uint16_t MinFrequency;
		uint16_t MaxFrequency;
		uint8_t Resolution;
	});
	
	class FloatInputService_FrequencyInterpolatedTable : public IFloatInputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatInputService_FrequencyInterpolatedTableConfig *_config;
		
		uint32_t _lastReadTick = 0;
		float _lastValue = 0;
		
	public:
		FloatInputService_FrequencyInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_FrequencyInterpolatedTableConfig *config);

		void ReadValue() override;
	};
}
#endif
