#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "HardwareAbstraction/ICallBack.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "stdint.h"
#include "Packed.h"

#ifndef GM24XDECODER_H
#define GM24XDECODER_H
namespace CrankCamDecoders
{
	PACK(
	struct Gm24xDecoderConfig {
		constexpr const unsigned int Size() const
		{
			return sizeof(Gm24xDecoderConfig);
		}

		uint16_t CrankPin;
		uint16_t CamPin;
	});

	class Gm24xDecoder : public ICrankCamDecoder
	{
	protected:
		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const Gm24xDecoderConfig *_config;

		unsigned char _state;
		unsigned char _crankState;
		bool _camTicked;
		bool _hasCamPosition;
		bool _isSynced;
		uint32_t _lastCamTick;
		uint32_t _lastCrankTick;
		uint32_t _crankPeriod;
		unsigned int crankTime();
	public:
		Gm24xDecoder(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const Gm24xDecoderConfig *config);
		float GetCrankPosition(void) override;
		float GetCamPosition(void) override;
		uint32_t GetTickPerDegree(void) override;
		unsigned short GetRpm(void) override;
		static void CrankInterruptCallBack(void *decoder);
		static void CamInterruptCallBack(void *decoder);
		void CrankInterrupt();
		void CamInterrupt();
		void CrankEdgeTrigger(EdgeTrigger edgeTrigger);
		void CamEdgeTrigger(EdgeTrigger edgeTrigger);
		bool IsSynced() override;
		bool HasCamPosition() override;
	};
}
#endif