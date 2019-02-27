#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "math.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(FLOATOUTPUTSERVICE_PWMINTERPOLATEDTABLE_H) && defined(IFLOATOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define FLOATOUTPUTSERVICE_PWMINTERPOLATEDTABLE_H
namespace IOServices
{
	PACK(
	struct FloatOutputService_PwmInterpolatedTableConfig
	{
	private:
		FloatOutputService_PwmInterpolatedTableConfig()
		{
			
		}
		
	public:
		constexpr const uint32_t Size() const
		{
			return sizeof(FloatOutputService_PwmInterpolatedTableConfig) +
				(sizeof(float) * Resolution);
		}
		
		constexpr const float *Table() const { return reinterpret_cast<const float *>(this + 1); }
		
		uint16_t PwmPin;
		uint16_t Frequency;
		float MinValue;
		float MaxValue;
		uint8_t Resolution;
	});

	class FloatOutputService_PwmInterpolatedTable : public IFloatOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatOutputService_PwmInterpolatedTableConfig *_config;

	public:
		FloatOutputService_PwmInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatOutputService_PwmInterpolatedTableConfig *config);
		
		void SetOutput(float value) override;
		void Calibrate() override;
	};
}
#endif
