#include "ITimerService.h"
#include "IDecoder.h"
#include "IFloatInputService.h"
#include "Interpolation.h"

using namespace HardwareAbstraction;
using namespace Decoder;
using namespace IOService;
using namespace Interpolation;

#include "IAfrService.h"

#if !defined(AFRSERVICE_MAP_ETHANOL_H) && defined(IAFRSERVICE_H)
#define AFRSERVICE_MAP_ETHANOL_H
namespace ApplicationService
{
	struct __attribute__((__packed__)) AfrService_Map_EthanolConfig
	{
	private:
		AfrService_Map_EthanolConfig()
		{
			
		}
	public:
		static AfrService_Map_EthanolConfig* Cast(void *p)
		{
			AfrService_Map_EthanolConfig *ret = (AfrService_Map_EthanolConfig *)p;
			
			ret->GasMap = (unsigned short *)(ret + 1);
			ret->EthanolMap = ret->GasMap + ret->AfrRpmResolution * ret->AfrMapResolution;
			
			ret->EctMultiplierTable = (unsigned char *)(ret->EthanolMap + ret->AfrRpmResolution * ret->AfrMapResolution);
			
			ret->StoichTable = (unsigned short *)(ret->EctMultiplierTable + ret->AfrEctResolution);
			
			ret->TpsMinAfrGas = ret->StoichTable + ret->StoichResolution;
			ret->TpsMinAfrEthanol = ret->TpsMinAfrGas + ret->AfrTpsResolution;
				
			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(AfrService_Map_EthanolConfig) +
				sizeof(unsigned short) * AfrRpmResolution * AfrMapResolution +
				sizeof(unsigned short) * AfrRpmResolution * AfrMapResolution +
				sizeof(unsigned char) * AfrEctResolution +
				sizeof(unsigned short) * StoichResolution +
				sizeof(unsigned short) * AfrTpsResolution +
				sizeof(unsigned short) * AfrTpsResolution;
		}
		
		float StartupAfrMultiplier;
		float StartupAfrDelay;
		float StartupAfrDecay;
		
		unsigned short MaxRpm;
		float MaxMapBar;
		unsigned char AfrRpmResolution;
		unsigned char AfrMapResolution;
		unsigned short *GasMap; // value in 1/1024
		unsigned short *EthanolMap; // value in 1/1024
		
		short MaxEct;
		short MinEct;
		unsigned char AfrEctResolution;
		unsigned char *EctMultiplierTable; // values in 1/255
		
		unsigned char StoichResolution;
		unsigned short *StoichTable;
		
		unsigned char AfrTpsResolution;
		unsigned short *TpsMinAfrGas;
		unsigned short *TpsMinAfrEthanol;
	};
	
class AfrService_Map_Ethanol : public IAfrService
	{
	protected:
		const AfrService_Map_EthanolConfig* _config;
		ITimerService *_timerService;
		IDecoder *_decoder;
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
			IDecoder *decoder,
			IFloatInputService *manifoldAbsolutePressureService,
			IFloatInputService *engineCoolantTemperatureService,  
			IFloatInputService *ethanolContentService, 
			IFloatInputService *throttlePositionService);
		void CalculateAfr();
	};
}
#endif