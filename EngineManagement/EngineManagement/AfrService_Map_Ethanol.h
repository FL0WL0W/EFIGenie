#if defined(IAfrServiceExists)
#define AfrService_Map_EthanolExists
namespace EngineManagement
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
			
			ret->TpsMinAfrGas = ret->StoichTable + ret->AfrTpsResolution;
			ret->TpsMinAfrEthanol = ret->TpsMinAfrGas + ret->AfrTpsResolution;
				
			return ret;
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
		unsigned int _startupTick;
		bool _started = false;
		bool _aeDone = false;
	public:
		AfrService_Map_Ethanol(const AfrService_Map_EthanolConfig *config);
		void CalculateAfr();
	};
}
#endif