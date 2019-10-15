// #include "Operations/IReluctor.h"
// #include "HardwareAbstraction/ICallBack.h"
// #include "HardwareAbstraction/HardwareAbstractionCollection.h"
// #include "stdint.h"
// #include "math.h"
// #include "Packed.h"

// #ifndef UNIVERSAL2XRELUCTOR_H
// #define UNIVERSAL2XRELUCTOR_H
// namespace Operations
// {
// 	PACK(
// 	struct Universal2xReluctorConfig {
// 		constexpr const unsigned int Size() const
// 		{
// 			return sizeof(Universal2xReluctorConfig);
// 		}

// 		uint16_t Pin;
// 		float RisingPosition;
// 		float FallingPosition;
// 	});

// 	class Universal2xReluctor : public IReluctor
// 	{
// 	protected:
// 		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
// 		HardwareAbstraction::ITimerService *_timerService;
// 		HardwareAbstraction::IDigitalService *_digitalService;
// 		const Universal2xReluctorConfig *_config;
// 		uint16_t _pin;

// 		bool _state;
// 		bool _isSynced;
// 		uint32_t _lastTick;
// 		uint32_t _period;
// 		const uint32_t time() const;
// 		bool _interruptCalled = false;
// 	public:
// 		Universal2xReluctor(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const Universal2xReluctorConfig *config);
// 		float GetPosition() override;
// 		float GetTickPerDegree() override;
// 		uint16_t GetRpm() override;
// 		uint16_t GetResolution() override;
// 		bool IsSynced() override;
// 		void InterruptCallBack();
// 	};
// }
// #endif