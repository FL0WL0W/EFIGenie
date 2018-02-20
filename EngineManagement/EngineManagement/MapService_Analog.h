namespace EngineManagement
{
	class MapService_Analog : public IMapService
	{
	protected:
		unsigned char _adcPin;
		float A0, A1, A2, A3;
		unsigned int _lastReadTick;
		float _lastMapKpa;
		unsigned short _dotSampleRate;
	public:
		MapService_Analog(void *config);
		void ReadMap();
	};
}