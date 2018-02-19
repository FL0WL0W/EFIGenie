namespace EngineManagement
{
	class IFuelTrimService
	{
	public:
		virtual short GetFuelTrim(unsigned char cylinder) = 0;
	};
}