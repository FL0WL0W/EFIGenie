#include "Reluctor/IReluctor.h"
#include "HardwareAbstraction/ICallBack.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "stdint.h"
#include "math.h"
#include "Packed.h"

#ifndef UNIVERSAL2XRELUCTOR_H
#define UNIVERSAL2XRELUCTOR_H
namespace Reluctor
{
	PACK(
	struct Universal2xReluctorConfig {
		constexpr const unsigned int Size() const
		{
			return sizeof(Universal2xReluctorConfig);
		}

		uint16_t Pin;
		float RisingPosition;
		float FallingPosition;
	});

	class Universal2xReluctor : public IReluctor
	{
	protected:
		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const Universal2xReluctorConfig *_config;

		bool _state;
		bool _isSynced;
		uint32_t _lastTick;
		uint32_t _period;
		const uint32_t time() const;
	public:
		Universal2xReluctor(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const Universal2xReluctorConfig *config);
		float GetPosition() override;
		uint32_t GetTickPerDegree() override;
		uint16_t GetRpm() override;
		uint16_t GetResolution() override;
		bool IsSynced() override;
		static void InterruptCallBack(void *reluctor);
		void Interrupt();
	};
}
#endif