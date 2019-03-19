#include "Reluctor/IReluctor.h"
#include "HardwareAbstraction/ICallBack.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "stdint.h"
#include "Packed.h"

#ifndef GM24XRELUCTOR_H
#define GM24XRELUCTOR_H
namespace Reluctor
{
	class Gm24xReluctor : public IReluctor
	{
	protected:
		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
		uint16_t _pin;

		unsigned char _state;
		unsigned char _subState;
		bool _isSynced;
		uint32_t _lastTick;
		uint32_t _period;
		const uint32_t time() const;
		bool _interruptCalled = false;
	public:
		Gm24xReluctor(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const uint16_t pin);
		float GetPosition() override;
		float GetTickPerDegree() override;
		uint16_t GetRpm() override;
		uint16_t GetResolution() override;
		static void InterruptCallBack(void *reluctor);
		bool IsSynced() override;
	};
}
#endif