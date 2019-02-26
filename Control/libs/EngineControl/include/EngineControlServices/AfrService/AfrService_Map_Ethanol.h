#include "HardwareAbstraction/ITimerService.h"
#include "CrankCamDecoders/ICrankCamDecoder.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "Interpolation.h"
#include "Packed.h"

using namespace HardwareAbstraction;
using namespace CrankCamDecoders;
using namespace IOServices;
using namespace Interpolation;

#include "EngineControlServices/AfrService/IAfrService.h"

#if !defined(AFRSERVICE_MAP_ETHANOL_H) && defined(IAFRSERVICE_H)
#define AFRSERVICE_MAP_ETHANOL_H
namespace EngineControlServices
{
	PACK(
	struct AfrService_Map_EthanolConfig
	{
	private:
		AfrService_Map_EthanolConfig()
		{
			
		}
	public:
		unsigned int Size() const
		{
			return sizeof(AfrService_Map_EthanolConfig) +
				sizeof(unsigned short) * AfrRpmResolution * AfrMapResolution +
				sizeof(unsigned short) * AfrRpmResolution * AfrMapResolution +
				sizeof(unsigned char) * AfrEctResolution +
				sizeof(unsigned short) * AfrTpsResolution +
				sizeof(unsigned short) * AfrTpsResolution +
				sizeof(unsigned short) * StoichResolution;
		}
		
		const unsigned short * GasMap() const { return (const unsigned short *)(this + 1); } // value in 1/1024
		const unsigned short * EthanolMap() const { return (const unsigned short *)(this + 1) + (AfrRpmResolution * AfrMapResolution); } // value in 1/1024
		const unsigned char * EctMultiplierTable() const { return (const unsigned char *)((const unsigned short *)(this + 1) + (2 * AfrRpmResolution * AfrMapResolution)); } // value in 1/255
		const unsigned short * TpsMaxAfrGas() const { return (const unsigned short *)((const unsigned char *)((const unsigned short *)(this + 1) + (2 * AfrRpmResolution * AfrMapResolution)) + AfrEctResolution); } // value in 1/255
		const unsigned short * TpsMaxAfrEthanol() const { return (const unsigned short *)((const unsigned char *)((const unsigned short *)(this + 1) + (2 * AfrRpmResolution * AfrMapResolution)) + AfrEctResolution) + AfrTpsResolution; } // value in 1/255
		const unsigned short * StoichTable() const { return (const unsigned short *)((const unsigned char *)((const unsigned short *)(this + 1) + (2 * AfrRpmResolution * AfrMapResolution)) + AfrEctResolution) + (2 * AfrTpsResolution); } // value in 1/255

		float StartupAfrMultiplier;
		float StartupAfrDelay;
		float StartupAfrDecay;
		
		unsigned short MaxRpm;
		float MaxMapBar;
		unsigned char AfrRpmResolution;
		unsigned char AfrMapResolution;
		
		short MaxEct;
		short MinEct;
		unsigned char AfrEctResolution;
		unsigned char AfrTpsResolution;
		unsigned char StoichResolution;
	});
	
class AfrService_Map_Ethanol : public IAfrService
	{
	protected:
		const AfrService_Map_EthanolConfig* _config;
		ITimerService *_timerService;
		ICrankCamDecoder *_decoder;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatInputService *_engineCoolantTemperatureService;  
		IFloatInputService *_ethanolContentService;
		IFloatInputService *_throttlePositionService;
		
		unsigned int _startupTick;
		bool _started = false;
		bool _aeDone = false;
	public:
		AfrService_Map_Ethanol(
		const AfrService_Map_EthanolConfig *config,
			ITimerService *timerService, 
			ICrankCamDecoder *decoder,
			IFloatInputService *manifoldAbsolutePressureService,
			IFloatInputService *engineCoolantTemperatureService,  
			IFloatInputService *ethanolContentService, 
			IFloatInputService *throttlePositionService);
		void CalculateAfr();
	};
}
#endif